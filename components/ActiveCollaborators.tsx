import { useOthers } from '@liveblocks/react/suspense'
import Image from 'next/image';
import React from 'react'

export default function ActiveCollaborators() {
    const others = useOthers();
    const collaborators = others.map((other) => other.info);
    return (
        <ul className='collaborators-list'>
            {collaborators.map(({ id, avatar, name, email, color }) => (
                <li key={id} className=''
                    title={`${name} (${email})`}
                >
                    <Image
                        src={avatar}
                        alt={name}
                        width={100}
                        height={100}
                        className='inline-block rounded-full size-8 ring-2 ring-dark-100'
                        style={{ border: `3px solid ${color}` }}
                    />
                </li>
            ))}
        </ul>
    )
}
