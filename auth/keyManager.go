package auth

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type KeyManager struct {
	keys map[string]string
}

func NewKeyManager() *KeyManager {
	return &KeyManager{
		keys: make(map[string]string),
	}
}

func (km *KeyManager) Generate() string {
	return strings.ReplaceAll(uuid.New().String(), "-", "")
}

func (km *KeyManager) Add(userUuid string, key string) {
	km.keys[userUuid] = key
	time.AfterFunc(60000*time.Millisecond, func() { km.remove(userUuid) })
}

func (km *KeyManager) remove(userUuid string) {
	delete(km.keys, userUuid)
}

func (km *KeyManager) Validate(key string) (string, error) {
	for userUuid, value := range km.keys {
		if value == key {
			return userUuid, nil
		}
	}
	return "", errors.New("key invalid")
}
