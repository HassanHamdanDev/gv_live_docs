
import CollaborativeRoom from '@/components/CollaborativeRoom'
import { getDocument } from '@/lib/actions/room.actions';
import { getClerckUsers } from '@/lib/actions/users.actions';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'

export default async function Document({ params: { id } }: SearchParamProps) {
    const clerckUser = await currentUser();
    if (!clerckUser) redirect('/sign-in');

    const room = await getDocument({
        roomId: id,
        userId: clerckUser.emailAddresses[0].emailAddress,
    });

    if (!room) redirect('/');


    const userIds = Object.keys(room.usersAccesses);
    const users = await getClerckUsers({ userIds });

    const usersData = users.map((user: User) => ({
        ...user,
        userType: room.usersAccesses[user.email]?.includes('room:write') ? 'editor' : 'viewer',
    }));

    const currentUserType = room.usersAccesses[clerckUser.emailAddresses[0].emailAddress]?.includes('room:write') ? 'editor' : 'viewer';

    return (
        <main className='flex w-full flex-col items-center'>
            <CollaborativeRoom
                roomId={id}
                roomMetadata={room.metadata}
                users={usersData}
                currentUserType={currentUserType}
            />
        </main>
    )
}

