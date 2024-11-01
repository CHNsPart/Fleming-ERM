import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";
import Image from "next/image";

export default async function Header() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const user = await getUser();
  console.log(user)
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <header className="bg-white border-b">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          <Image src="/logo.png" priority quality={100} alt="ERS" width={120} height={120} />
        </Link>
        {await isAuthenticated() ? (
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user?.picture || ''} alt={user?.given_name || ''} />
              <AvatarFallback>{getInitials(user?.given_name || user?.email || 'User')}</AvatarFallback>
            </Avatar>
            <LogoutLink>
              <Button variant="destructive">Log out</Button>
            </LogoutLink>
          </div>
        ) : (
          <Link href="/login">
            <Button>Log in</Button>
          </Link>
        )}
      </div>
    </header>
  )
}