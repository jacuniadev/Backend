package types

type MachineDynamicData struct {
	CPU            CPUStats                `json:"cpu"`
	RAM            RAMStats                `json:"ram"`
	GPU            GPUStats                `json:"gpu"`
	Disks          []DiskStats             `json:"disks"`
	Temps          []TempStats             `json:"temps"`
	Network        []NetworkInterfaceStats `json:"network"`
	ProcessCount   uint64                  `json:"process_count"`
	HostUptime     uint64                  `json:"host_uptime"`
	ReporterUptime uint64                  `json:"reporter_uptime"`
}

type NetworkInterfaceStats struct {
	Name  string  `json:"n"`
	Tx    uint64  `json:"tx"`
	Rx    uint64  `json:"rx"`
	Speed float32 `json:"s"`
}

type CPUStats struct {
	Usage []uint16 `json:"usage"`
	Freq  []uint16 `json:"freq"`
}

type RAMStats struct {
	Used  uint64 `json:"used"`
	Total uint64 `json:"total"`
}

type GPUStats struct {
	Brand      string `json:"brand"`
	GpuUsage   int32  `json:"gpu_usage"`
	PowerUsage int32  `json:"power_usage"`
}

type DiskStats struct {
	Name  string `json:"name"`
	Mount string `json:"mount"`
	Fs    string `json:"fs"`
	Type  string `json:"r"`
	Total uint64 `json:"total"`
	Used  uint64 `json:"used"`
}

type TempStats struct {
	Label string  `json:"label"`
	Value float32 `json:"value"`
}
