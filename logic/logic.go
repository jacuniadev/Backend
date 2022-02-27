package logic

import (
	"runtime"
	"time"

	"github.com/xornet-cloud/Backend/types"
)

func GetMemoryUsage() uint64 {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	return m.Alloc
}

func GetAverageSumFromArray(arr []uint16) float32 {
	var sum float32 = 0.0
	for i := 0; i < len(arr); i++ {
		sum = sum + float32(arr[i])
	}
	var average = sum / float32(len(arr))
	return average
}

func GetTotalTraffic(arr []types.NetworkInterfaceStats) (float32, float32) {
	var sumTx float32 = 0.0
	var sumRx float32 = 0.0
	var length = float32(len(arr))

	for _, v := range arr {
		sumTx = sumTx + float32(v.Tx)
		sumRx = sumRx + float32(v.Rx)
	}

	// I don't know why but i had to multiply this by 2
	return ((sumTx / length) / 1024 / 1024) * 2, ((sumRx / length) / 1024 / 1024) * 2
}

func MakeTimestamp() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}
