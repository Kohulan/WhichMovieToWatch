import { Outlet } from 'react-router';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default App;
