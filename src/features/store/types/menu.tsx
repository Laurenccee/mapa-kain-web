export interface MenuItemRecord {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
}

export interface CreateMenuFormProps {
  onPreviewChange?: (data: {
    image_url: string;
    name: string;
    price: number;
    description: string;
    available: boolean;
  }) => void;
  onSuccess?: () => void;
}

export interface UpdateMenuFormProps extends CreateMenuFormProps {
  menuItem: MenuItemRecord;
}

export interface UpdateMenuDialogProps {
  menuItem: MenuItemRecord;
}

export interface MenuSectionProps {
  storeId: string;
}
