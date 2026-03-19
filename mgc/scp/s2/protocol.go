// Package s2 implements the MGC SCP protocol at schema version 2.
package s2

import (
	"encoding/json"
	"fmt"

	"github.com/dickdangle/zoote.goose/mgc/scp"
)

// requiredFields lists all fields required by the s2 schema.
var requiredFields = []string{"id", "name"}

// Protocol is the s2 schema implementation of scp.Protocol.
type Protocol struct{}

// New returns a new s2 Protocol instance.
func New() *Protocol { return &Protocol{} }

// Version returns the s2 schema version.
func (p *Protocol) Version() scp.Version { return scp.VersionS2 }

// Encode marshals data to JSON after validating required s2 fields.
func (p *Protocol) Encode(data map[string]any) ([]byte, error) {
	if err := validate(data); err != nil {
		return nil, err
	}
	return json.Marshal(data)
}

// Decode unmarshals JSON bytes and validates the required s2 fields.
func (p *Protocol) Decode(b []byte) (map[string]any, error) {
	var data map[string]any
	if err := json.Unmarshal(b, &data); err != nil {
		return nil, err
	}
	if err := validate(data); err != nil {
		return nil, err
	}
	return data, nil
}

func validate(data map[string]any) error {
	for _, f := range requiredFields {
		if _, ok := data[f]; !ok {
			return fmt.Errorf("s2: missing required field %q", f)
		}
	}
	return nil
}
