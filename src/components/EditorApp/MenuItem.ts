export interface MenuItem {
  label: string;
  key?: string;
  action?: () => void;
  items?: MenuItem[];
}
