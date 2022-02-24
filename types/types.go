package types

type BackendStatus struct {
	MemoryUsage uint64 `json:"memory_usage" xml:"memory_usage" form:"memory_usage"`
}
