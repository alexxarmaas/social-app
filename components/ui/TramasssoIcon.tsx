import type { IconType } from "react-icons";
import {
  FiActivity, FiArrowRight, FiArrowUpRight, FiAward, FiBell, FiCalendar,
  FiCamera, FiCheck, FiCompass, FiFlag, FiGrid, FiHeart, FiInstagram,
  FiMap, FiMapPin, FiMessageCircle, FiPlus, FiSearch, FiShield, FiStar,
  FiTool, FiUser, FiUsers, FiZap,
} from "react-icons/fi";

const ICONS = {
  activity: FiActivity,
  arrow: FiArrowUpRight,
  next: FiArrowRight,
  award: FiAward,
  bell: FiBell,
  calendar: FiCalendar,
  camera: FiCamera,
  check: FiCheck,
  clubs: FiFlag,
  compass: FiCompass,
  garage: FiGrid,
  heart: FiHeart,
  instagram: FiInstagram,
  map: FiMap,
  location: FiMapPin,
  community: FiMessageCircle,
  plus: FiPlus,
  search: FiSearch,
  security: FiShield,
  star: FiStar,
  tools: FiTool,
  profile: FiUser,
  members: FiUsers,
  routes: FiCompass,
  events: FiCalendar,
  partners: FiAward,
  zap: FiZap,
} satisfies Record<string, IconType>;

export type TramasssoIconName = keyof typeof ICONS;

type Props = {
  name: TramasssoIconName;
  size?: "sm" | "md" | "lg";
  frame?: boolean;
  className?: string;
};

/** Shared, decorative icons with one stroke family and predictable sizing. */
export default function TramasssoIcon({
  name, size = "md", frame = true, className = "",
}: Props) {
  const Icon = ICONS[name];
  const sizes = { sm: 17, md: 21, lg: 25 } as const;
  if (!frame) return <Icon aria-hidden="true" focusable="false" size={sizes[size]} className={"shrink-0 " + className} />;
  return (
    <span aria-hidden="true"
      className={"trm-icon-frame " +
        (size === "sm" ? "h-9 w-9 rounded-xl" : size === "lg" ? "h-14 w-14 rounded-2xl" : "h-12 w-12 rounded-[0.95rem]") +
        " " + className}>
      <Icon focusable="false" size={sizes[size]} />
    </span>
  );
}
