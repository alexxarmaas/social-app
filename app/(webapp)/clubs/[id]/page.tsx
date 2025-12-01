import { getClub, getClubMembers, getClubMembersCars } from "@/app/actions/club";
import { getEvents } from "@/app/actions/event";
import { notFound } from "next/navigation";
import ClubHeader from "@/components/clubs/ClubHeader";
import ClubContent from "@/components/clubs/ClubContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export default async function ClubPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    const { club, userMembership } = await getClub(id);

    if (!club) {
        notFound();
    }

    const currentUser = {
        isMember: userMembership?.status === 'approved',
        isPending: userMembership?.status === 'pending',
        isAdmin: userMembership?.role === 'admin',
        id: currentUserId
    };

    const { members } = await getClubMembers(id, currentUser.isAdmin);

    // Fetch events for this club (including private ones)
    const { events } = await getEvents('upcoming', id);
    const clubEvents = events || [];

    // Fetch club garage cars
    const { cars: clubCars } = await getClubMembersCars(id);



    return (
        <div className="min-h-screen pb-20">
            <div className="container mx-auto px-4 py-6 space-y-8">
                <ClubHeader
                    club={club}
                    isOwner={club.ownerId === currentUserId}
                    isAdmin={currentUser.isAdmin}
                    isMember={currentUser.isMember}
                />
                <ClubContent
                    clubId={id}
                    currentUser={currentUser}
                    initialEvents={clubEvents}
                    members={members || []}
                    clubCars={clubCars || []}
                />
            </div>
        </div>
    );
}
