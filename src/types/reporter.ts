export interface DynamicData {
  cpu: {
    usage: number[];
    freq: number[];
  };
  disks: Disk[];
  gpu?: GPU;
  processes: string;
  ram: { total: number; used: number };
}
export interface Disk {
  fs: string;
  mount: string;
  total: number;
  type: string;
  used: number;
}

export interface GPU {
  brand: string;
  gpu_usage: number;
  mem_total: number;
  mem_used: number;
  power_usage: number;
}
