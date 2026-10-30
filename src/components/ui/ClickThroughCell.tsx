import type { ReactNode } from 'react';

export const ClickThroughCell = ({ children }: { children: ReactNode }) => <div className="pointer-events-none min-w-0">{children}</div>;
