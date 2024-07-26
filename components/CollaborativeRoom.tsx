'use client';
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import Loader from "./Loader";
import Header from "./Header";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import ActiveCollaborators from "./ActiveCollaborators";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import Image from "next/image";
import { updateDocument } from "@/lib/actions/room.actions";
import { Editor } from "./editor/Editor";
import ShareModal from "./ShareModal";

export default function CollaborativeRoom({ roomId, roomMetadata, users, currentUserType }: CollaborativeRoomProps) {

    const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
    const [editting, setEditting] = useState(false);
    const [loading, setLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setLoading(true);
            try {
                if (documentTitle !== roomMetadata.title) {
                    // update the document title
                    const updatedDocument = await updateDocument(roomId, documentTitle);
                    if (updatedDocument) {
                        setEditting(false);
                    }
                }
            } catch (error) {
                console.error('Error happened while updating the document title', error);
            }
            setLoading(false);
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setEditting(false);
                updateDocument(roomId, documentTitle);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [roomId, documentTitle])

    useEffect(() => {
        if (editting && inputRef.current) {
            inputRef.current?.focus();
        }
    }, [editting])

    return (
        <div>
            <RoomProvider id={roomId}>
                <ClientSideSuspense fallback={<Loader />}>
                    <div className="collaborative-room">
                        <Header>
                            <div
                                ref={containerRef}
                                className='flex w-fit items-center justify-center gap-2'
                            >
                                {editting && !loading ? (
                                    <Input
                                        type="text"
                                        ref={inputRef}
                                        placeholder="Document title"
                                        value={documentTitle}
                                        onChange={(e) => setDocumentTitle(e.target.value)}
                                        onKeyDown={updateTitleHandler}
                                        disabled={!editting}
                                        className="document-title-input"
                                    />
                                ) : (
                                    <>
                                        <p className="document-title">{documentTitle}</p>
                                    </>
                                )}
                                {currentUserType === 'editor' && !editting && (
                                    <Image
                                        src="/assets/icons/edit.svg"
                                        alt="edit"
                                        width={24}
                                        height={24}
                                        onClick={() => setEditting(true)}
                                        className="pointer"
                                    />
                                )}
                                {currentUserType !== 'editor' && !loading && (
                                    <p className="view-only-tag">View Only</p>
                                )}
                                {loading && (
                                    <p className="text-sm text-gray-400">saving...</p>
                                )}
                            </div>
                            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
                                <ActiveCollaborators />
                                <ShareModal
                                    roomId={roomId}
                                    collaborators={users}
                                    creatorId={roomMetadata.creatorId}
                                    currentUserType={currentUserType}
                                />
                                <SignedOut>
                                    <SignInButton />
                                </SignedOut>
                                <SignedIn>
                                    <UserButton />
                                </SignedIn>
                            </div>
                        </Header>
                        <Editor
                            roomId={roomId}
                            currentUserType={currentUserType}
                        />
                    </div>
                </ClientSideSuspense>
            </RoomProvider>
        </div>
    )
}
