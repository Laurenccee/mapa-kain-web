import { MenuData, MenuFormData } from "../schemas/menuSchema";

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
  menuItemsPromise: Promise<{
    success: boolean;
    data: any[];
    message?: string;
  }>;
}

export interface MenuBaseFormProps {
  mode: "create" | "update";
  storeId: string;
  itemId?: string;
  initialValues: MenuFormData;
  previousImageUrl?: string | null;
  onPreviewChange?: (preview: any) => void;
  onSuccess?: () => void;
  submitAction: (
    data: MenuData,
    targetId: string,
  ) => Promise<{ success: boolean; message?: string } | undefined | void>;
}

export interface MenuCardProps {
  image_url: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
  showEditButton?: boolean;
  menuItem?: MenuItemRecord;

  actionButton?: React.ReactNode;
}

export type MenuPreviewData = {
  image_url: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
};

export type MenuDialogRenderProps = {
  setPreviewData: React.Dispatch<React.SetStateAction<MenuPreviewData>>;
  closeDialog: () => void;
};

export interface MenuDialogBaseProps {
  triggerButton: React.ReactNode;
  title: string;
  description: string;
  initialPreview?: MenuPreviewData;
  renderForm: (props: MenuDialogRenderProps) => React.ReactNode;
}
