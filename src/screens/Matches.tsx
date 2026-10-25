import { useState } from 'react'
import { useApp } from '../state/context'
import { topicColor, topicName } from '../data/topics'
import { plural } from '../lib/text'
import { PeerCard } from '../components/PeerCard'
import { Chip, EmptyState, SectionTitle } from '../components/ui'
import { btn } from '../components/styles'
import type { ReactNode } from 'react'
import type { Match } from '../types'

export default function Matches() {
  const { state, matches, tests } = useApp()
  const [topics, setTopics] = useState<string[]>([])
  const [withTests, setWithTests] = useState(false)
  const [onlineOnly, setOnlineOnly] = useState(false)

  const active = topics.length > 0 || withTests || onlineOnly
  const testCount = (id: string) => tests.filter((t) => t.authorId === id).length

  const filtered = matches.filter(
    (m) =>
      (topics.length === 0 || m.theyTeachYou.some((t) => topics.includes(t))) &&
      (!withTests || testCount(m.student.id) > 0) &&
      (!onlineOnly || m.student.online),
  )
  const swaps = filtered.filter((m) => m.kind === 'swap')
  const helpers = filtered.filter((m) => m.kind === 'helper')

  function toggleTopic(id: string) {
    setTopics((list) => (list.includes(id) ? list.filter((t) => t !== id) : [...list, id]))
  }

  function clearFilters() {
    setTopics([])
    setWithTests(false)
    setOnlineOnly(false)
  }

  const renderList = (list: Match[]) => (
    <ul className="space-y-4">
      {list.map((m) => (
        <li key={m.student.id}>
          <PeerCard student={m.student} theyTeachYou={m.theyTeachYou} youTeachThem={m.youTeachThem} />
        </li>
      ))}
    </ul>
  )

  return (
    <div className="space-y-6 pb-6 pt-3">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Matches</h1>
        <button type="button" onClick={clearFilters} disabled={!active} className={btn.text}>
          Clear filters
        </button>
      </header>

      <div>
        <p className="mb-2 text-sm text-haze">
          Peers who teach what you’re learning: {state.learning.map(topicName).join(', ')}.
        </p>
        <div role="group" aria-label="Filter matches" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {state.learning.map((id) => (
            <Chip key={id} selected={topics.includes(id)} color={topicColor(id)} onClick={() => toggleTopic(id)}>
              {topicName(id)}
            </Chip>
          ))}
          <Chip selected={withTests} onClick={() => setWithTests((v) => !v)}>
            Made practice tests
          </Chip>
          <Chip selected={onlineOnly} onClick={() => setOnlineOnly((v) => !v)}>
            Online now
          </Chip>
        </div>
        <p className="mt-2 text-sm text-haze" aria-live="polite">
          {plural(filtered.length, 'peer')} {active ? 'match these filters' : 'can help you'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="matches"
          title="No peers match these filters"
          titleAs="h2"
          action={
            <button type="button" onClick={clearFilters} className={btn.small}>
              Clear filters
            </button>
          }
        >
          Every peer was filtered out. Remove a filter to see more people who can help you.
        </EmptyState>
      ) : (
        <>
          <section aria-labelledby="swap-title">
            <SectionTitle id="swap-title">You can swap</SectionTitle>
            <p className="-mt-2 mb-3 text-sm text-haze">They teach what you need, and you teach what they need.</p>
            {swaps.length > 0 ? (
              renderList(swaps)
            ) : (
              <SectionEmpty active={active} onClear={clearFilters}>
                {active
                  ? 'No swap partners match these filters.'
                  : 'No one wants to learn what you teach yet, so there are no swaps right now.'}
              </SectionEmpty>
            )}
          </section>

          <section aria-labelledby="help-title">
            <SectionTitle id="help-title">Can help you</SectionTitle>
            <p className="-mt-2 mb-3 text-sm text-haze">They teach what you need. You pay with credits.</p>
            {helpers.length > 0 ? (
              renderList(helpers)
            ) : (
              <SectionEmpty active={active} onClear={clearFilters}>
                {active ? 'No other helpers match these filters.' : 'Everyone who can help you is also a swap partner.'}
              </SectionEmpty>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function SectionEmpty({ active, onClear, children }: { active: boolean; onClear: () => void; children: ReactNode }) {
  return (
    <p className="rounded-card bg-panel p-5 text-sm text-muted">
      {children}{' '}
      {active && (
        <button type="button" onClick={onClear} className="font-semibold text-sand underline underline-offset-4">
          Clear filters
        </button>
      )}
    </p>
  )
}
