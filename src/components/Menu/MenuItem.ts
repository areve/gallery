export interface MenuItem {
  label: string;
  keyPreventDefault?: boolean;
  key?: string;
  action?: () => void;
  items?: MenuItem[];
}
