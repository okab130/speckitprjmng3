import { ThemeConfig } from 'antd';

// GitHub-like color palette
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#0969da', // GitHub blue
    colorSuccess: '#1a7f37', // GitHub green
    colorWarning: '#9a6700', // GitHub orange
    colorError: '#cf222e',   // GitHub red
    colorInfo: '#0969da',    // GitHub blue
    colorTextBase: '#24292f',
    colorBgBase: '#ffffff',
    borderRadius: 6,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#24292e',
      siderBg: '#f6f8fa',
      bodyBg: '#ffffff',
    },
    Menu: {
      itemBg: '#f6f8fa',
      itemSelectedBg: '#e6f0ff',
      itemSelectedColor: '#0969da',
    },
    Button: {
      primaryColor: '#ffffff',
    },
    Table: {
      headerBg: '#f6f8fa',
      headerColor: '#24292f',
      rowHoverBg: '#f6f8fa',
    },
  },
};
