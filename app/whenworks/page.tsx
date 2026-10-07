import CreateApp from './_components/create'
import { emailEnabled } from './_lib/server'

export default function WhenworksPage() {
  // Email fields stay hidden until an email service (Resend) is configured.
  return <CreateApp emailEnabled={emailEnabled()} />
}
