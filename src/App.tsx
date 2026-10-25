import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppStateProvider } from './state/AppStateProvider'
import { TabBar } from './components/TabBar'
import { Toast } from './components/Toast'
import { PrototypeBadge } from './components/ui'
import Home from './screens/Home'
import Topic from './screens/Topic'
import TakeTest from './screens/TakeTest'
import CreateTest from './screens/CreateTest'
import Practice from './screens/Practice'
import Resources from './screens/Resources'
import ShareResource from './screens/ShareResource'
import ResourceDetail from './screens/ResourceDetail'
import Matches from './screens/Matches'
import Peer from './screens/Peer'
import ChatList from './screens/ChatList'
import Chat from './screens/Chat'
import NotFound from './screens/NotFound'

/** The bottom tab bar only shows on the five tab screens. */
const TAB_ROUTES = ['/', '/matches', '/practice', '/resources', '/chat']

function Shell() {
  const { pathname, hash } = useLocation()
  const showTabs = TAB_ROUTES.includes(pathname)

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return (
    <div className="relative mx-auto min-h-dvh max-w-[420px] px-4 pt-3">
      <PrototypeBadge />
      <Toast />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topics/:topicId" element={<Topic />} />
          <Route path="/test/:testId" element={<TakeTest />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/practice/new" element={<CreateTest />} />
          <Route path="/practice/edit/:testId" element={<CreateTest />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/new" element={<ShareResource />} />
          <Route path="/resources/:resourceId" element={<ResourceDetail />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/peers/:peerId" element={<Peer />} />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:peerId" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showTabs && <TabBar />}
    </div>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AppStateProvider>
  )
}
