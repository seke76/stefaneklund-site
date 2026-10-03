import Link from 'next/link'
import styles from './page.module.css'

export default function WhenWorksPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>WhenWorks</h1>
      <p>Appen är på väg. Kom tillbaka snart.</p>
      <Link href="/" className={styles.back}>
        &lt; tillbaka till stefaneklund.se
      </Link>
    </main>
  )
}
