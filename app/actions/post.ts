"use server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/lib/auth";
import { createNotification } from "./notification";
import { uploadFileToBlob } from "@/app/lib/blob";
import { sendNotification } from "@/app/actions/notifications";

export async function createPost(formData: FormData) {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        const content = formData.get("content") as string;
        let imageUrl: string | null = null;
        const imageFile = formData.get("image") as File | null;
        if (imageFile && typeof imageFile === "object") {
            imageUrl = await uploadFileToBlob(imageFile, "post");
        }

        const clubId = formData.get("clubId") as string | null;

        const post = await prisma.post.create({
            data: {
                content,
                imageUrl,
                authorId: session.user.id,
                clubId: clubId || undefined,
            },
        });

        revalidatePath("/webapp/feed");
        return { post };
    } catch (error) {
        console.error("Error creating post:", error);
        return { error: "Error al crear la publicación" };
    }
}

export async function getPosts() {
    try {
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.id;

        const posts = await prisma.post.findMany({
            where: {
                clubId: null // Only fetch posts that don't belong to a club
            },
            include: {
                author: {
                    select: {
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
                likes: currentUserId ? {
                    where: {
                        userId: currentUserId,
                    },
                    select: {
                        userId: true,
                    },
                } : false,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Transform posts to include isLiked boolean
        const formattedPosts = posts.map((post: any) => ({
            ...post,
            isLiked: (post.likes?.length ?? 0) > 0,
            likes: undefined, // Remove the likes array from the response
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
        }));

        return { posts: formattedPosts };
    } catch (error) {
        console.error("Error fetching posts:", error);
        return { error: "Error al cargar las publicaciones" };
    }
}

export async function getPost(postId: string) {
    try {
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.id;

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
                likes: currentUserId ? {
                    where: {
                        userId: currentUserId,
                    },
                    select: {
                        userId: true,
                    },
                } : false,
            },
        });

        if (!post) {
            return { error: "Publicación no encontrada" };
        }

        const formattedPost = {
            ...post,
            isLiked: (post.likes?.length ?? 0) > 0,
            likes: undefined,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
        };

        return { post: formattedPost };
    } catch (error) {
        console.error("Error fetching post:", error);
        return { error: "Error al cargar la publicación" };
    }
}

export async function toggleLike(postId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId,
                },
            },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });
        } else {
            await prisma.like.create({
                data: {
                    userId: session.user.id,
                    postId,
                },
            });

            // Notify author
            const post = await prisma.post.findUnique({
                where: { id: postId },
                select: { authorId: true }
            });

            if (post) {
                await createNotification(
                    "LIKE",
                    post.authorId,
                    session.user.id,
                    "le gustó tu publicación",
                    postId
                );

                // Push Notification
                if (post.authorId !== session.user.id) {
                    sendNotification(
                        post.authorId,
                        "Nuevo Like",
                        `${session.user.name || session.user.username} le gustó tu publicación`,
                        `/post/${postId}`
                    );
                }
            }
        }

        // Check if post belongs to a club to revalidate correct path
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { clubId: true }
        });

        if (post?.clubId) {
            revalidatePath(`/clubs/${post.clubId}`);
        } else {
            revalidatePath("/feed");
        }

        return { liked: !existingLike };
    } catch (error) {
        console.error("Error toggling like:", error);
        return { error: "Error al dar like" };
    }
}

export async function getComments(postId: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return { comments };
    } catch (error) {
        console.error("Error fetching comments:", error);
        return { error: "Error al cargar comentarios" };
    }
}

export async function addComment(postId: string, content: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    if (!content.trim()) {
        return { error: "El comentario no puede estar vacío" };
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                authorId: session.user.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        // Notify author
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });

        if (post) {
            await createNotification(
                "COMMENT",
                post.authorId,
                session.user.id,
                "comentó en tu publicación",
                postId
            );

            // Push Notification
            if (post.authorId !== session.user.id) {
                sendNotification(
                    post.authorId,
                    "Nuevo Comentario",
                    `${session.user.name || session.user.username} comentó: "${content.length > 30 ? content.substring(0, 30) + '...' : content}"`,
                    `/post/${postId}`
                );
            }
        }

        revalidatePath("/feed");
        return { success: true, comment };
    } catch (error) {
        console.error("Error adding comment:", error);
        return { error: "Error al publicar comentario" };
    }
}

export async function deleteComment(commentId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return { error: "No autenticado" };
    }

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return { error: "Comentario no encontrado" };
        }

        if (comment.authorId !== session.user.id) {
            return { error: "No tienes permiso para eliminar este comentario" };
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        revalidatePath("/feed");
        return { success: true };
    } catch (error) {
        console.error("Error deleting comment:", error);
        return { error: "Error al eliminar comentario" };
    }
}
