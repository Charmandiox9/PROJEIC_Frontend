'use client';

import { ProjectMember, getInitials } from './types';

export default function MemberAvatar({ member }: { member: ProjectMember }) {
  return member.user.avatarUrl ? (
    <img
      src={member.user.avatarUrl}
      alt={member.user.name}
      referrerPolicy="no-referrer"
      className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white"
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-white">
      {getInitials(member.user.name)}
    </div>
  );
}
