import AddDocumentBtn from '@/components/AddDocumentBtn';
import { DeleteModal } from '@/components/DeleteModal';
import Header from '@/components/Header'
import Notifications from '@/components/Notifications';
import { getDocuments } from '@/lib/actions/room.actions';
import { dateConverter } from '@/lib/utils';
import { SignedIn, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Home() {

  const clerckUser = await currentUser();
  if (!clerckUser) redirect('/sign-in');

  const roomDocuments = await getDocuments(clerckUser.emailAddresses[0].emailAddress);

  return (
    <main className='home-container'>
      <Header className='sticky left-0 top-0'>
        <div className="flex items-center gap-2 lg:gap-4">
          <Notifications />
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Header>
      {roomDocuments.data.length > 0 ? (
        <div className="document-list-container">
          <div className="document-list-title">
            <h3 className='text-28-semibold'>All Documents</h3>
            <AddDocumentBtn
              userId={clerckUser.id}
              email={clerckUser.emailAddresses[0].emailAddress}
            />
          </div>
          <ul className='document-ul'>
            {roomDocuments.data.map(({ id, metadata, createdAt }: any) => (
              <li key={id} className='document-list-item'>
                <Link
                  href={`/documents/${id}`}
                  className='flex flex-1 items-center gap-4'
                >
                  <div className="hidden rounded-md bg-dark-500 p-2 sm:block">
                    <Image
                      src='/assets/icons/doc.svg'
                      alt='file'
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className='line-clamp-1 text-lg'>{metadata.title}</p>
                    <p className='text-sm text-blue-100 font-light'>Created about {dateConverter(createdAt)}</p>
                  </div>
                </Link>
                {metadata?.creatorId == clerckUser?.id && <DeleteModal roomId={id} />}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="document-list-empty">
          <Image
            src="/assets/icons/doc.svg"
            alt="Document"
            width={40}
            height={40}
            className='mx-auto'
          />
          <AddDocumentBtn
            userId={clerckUser.id}
            email={clerckUser.emailAddresses[0].emailAddress}
          />
        </div>
      )}
    </main>
  )
}
