import IndexPage from './pages/index/page';

export interface RouteItem {
  path: string;
  name: string;
  component: any;
  props?: Record<string, any>;
}

export const routes: RouteItem[] = [
  { path: '/', name: 'Index', component: IndexPage, props: { requireAccess: true } },
];
