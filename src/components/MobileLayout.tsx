import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonIcon } from '@ionic/react'
import { useAuth } from '../context/AuthContext'
import ToastContainer from './Toast'
import { homeOutline, trendingUpOutline, trendingDownOutline, barChartOutline, personOutline } from 'ionicons/icons'

export default function MobileLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Dashboard', icon: homeOutline, path: '/dashboard' },
    { label: 'Pemasukan', icon: trendingUpOutline, path: '/pemasukan' },
    { label: 'Pengeluaran', icon: trendingDownOutline, path: '/pengeluaran' },
    { label: 'Laporan', icon: barChartOutline, path: '/laporan' },
    { label: 'Profile', icon: personOutline, path: '/profile' },
  ]

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <div slot="start" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--ion-color-primary)',
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: 11,
            }}>
              {initials}
            </span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>ManagementFlow</span>
          </div>
        </IonToolbar>
      </IonHeader>
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
