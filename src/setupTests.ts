import {configure} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import 'isomorphic-fetch';

configure({adapter: new Adapter()});
