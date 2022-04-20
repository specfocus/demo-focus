export const DEFAULT_DELAY = 0;
export const DEFAULT_MAXSIZE = 65536;
export const DEFAULT_VT = 30;

export declare interface Queue {
  ns?: string;
  qname: string;
}

export const makeKey = ({ ns, qname}: Queue) => (ns ? `${ns}:${qname}` : `${qname}`);

export const makeQKey = ({ ns, qname}: Queue) => (ns ? `${ns}:${qname}:Q` : `${qname}:Q`);
