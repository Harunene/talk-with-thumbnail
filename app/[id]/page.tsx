import Home from '@/components/Home'
import type { Metadata, ResolvingMetadata } from 'next'
import { getMessageData } from '@/lib/blob'
import { isCharacterId } from '@/lib/characters'
import { buildOgImageUrl, buildShareMetadata, getSiteHost } from '@/lib/metadata'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  const messageData = await getMessageData(id)
  const imageType = messageData?.imageType && isCharacterId(messageData.imageType)
    ? messageData.imageType
    : 'hikari'
  const host = getSiteHost()
  const ogImageUrl = buildOgImageUrl(host, {
    message: messageData?.message,
    imageType,
    subType: messageData?.subType,
    zoomMode: messageData?.zoomMode,
    backgroundId: messageData?.backgroundId,
  })

  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const isDiscordBot = userAgent.includes('Discordbot')

  return buildShareMetadata(ogImageUrl, { isDiscordBot })
}

export default async function Page(props: Props) {
  const { id } = await props.params
  const messageData = await getMessageData(id)

  if (!messageData) {
    notFound()
  }

  return <Home key={id} messageId={id} initialData={messageData} />
}
