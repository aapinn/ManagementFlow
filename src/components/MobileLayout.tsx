import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { IonPage, IonContent, IonIcon } from '@ionic/react'
import ToastContainer from './Toast'
import { homeOutline, trendingUpOutline, trendingDownOutline, barChartOutline, personOutline } from 'ionicons/icons'

export default function MobileLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Dashboard', icon: homeOutline, path: '/dashboard' },
    { label: 'Pemasukan', icon: trendingUpOutline, path: '/pemasukan' },
    { label: 'Pengeluaran', icon: trendingDownOutline, path: '/pengeluaran' },
    { label: 'Laporan', icon: barChartOutline, path: '/laporan' },
    { label: 'Profile', icon: personOutline, path: '/profile' },
  ]

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <Outlet />
      </IonContent>
      <div className="tab-bar">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              className={`tab-bar-btn${isActive ? ' tab-bar-btn--active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <IonIcon icon={tab.icon} />
              <span className="tab-bar-label">{tab.label}</span>
            </button>
          )
        })}
      </div>
      <ToastContainer />
    </IonPage>
  )
}
