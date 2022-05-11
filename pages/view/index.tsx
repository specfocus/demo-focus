import View from '@specfocus/view-focus/components/list/View';
import useSelection from '@specfocus/view-focus/components/list/useSelection';
import { useMemo } from 'react';
import useEvent from '@specfocus/view-focus/effects/useEvent';
import GraphIcon from '@mui/icons-material/AccountTreeOutlined';
import LabIcon from '@mui/icons-material/AutoGraph';
import ChartIcon from '@mui/icons-material/BubbleChart';
import ChatIcon from '@mui/icons-material/ChatOutlined';
import GraphiqlIcon from '@mui/icons-material/Code'; // GraphicEq';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ProvidersIcon from '@mui/icons-material/ElectricRickshawOutlined'; // LocalShipping
import ExploreIcon from '@mui/icons-material/ExploreOutlined';
import TodoIcon from '@mui/icons-material/ListAltOutlined';
import LocaleIcon from '@mui/icons-material/LocationOnOutlined'; // PublicOffOutlined';
import ManageAccounts from '@mui/icons-material/ManageAccountsOutlined';
import GrahqlEditIcon from '@mui/icons-material/Memory';
import CheckoutIcon from '@mui/icons-material/ShoppingCartOutlined';
import MeasureIcon from '@mui/icons-material/StraightenOutlined';
import RealtimeIcon from '@mui/icons-material/TimerOffOutlined';

const Page = () => {
  const { selection, onSelect } = useSelection();

  const sections = useMemo(
    () => {
      return {
        colors: {
          subheader: 'Colors',
          options: {
            green: {
              icon: ChatIcon,
              primary: 'Green',
              secondary: 'a color'
            }
          }
        }
      }
    },
    []
  );

  return (
    <View onSelect={onSelect} sections={sections} selection={selection} slim={false} />
  );
};

export default Page;