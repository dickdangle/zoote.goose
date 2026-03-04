// Package s3 implements the MGC SCP protocol at schema version 3.
//
// s3 extends s2 by adding a required "version" field to each payload and
// provides an Upgrade path from s2 payloads.
package s3

import (
	"encoding/json"
	"fmt"

	"github.com/dickdangle/zoote.goose/mgc/scp"
)

// requiredFields lists all fields required by the s3 schema.
var requiredFields = []string{"id", "name", "version"}

// Protocol is the s3 schema implementation of scp.Protocol and scp.Upgrader.
type Protocol struct{}

// New returns a new s3 Protocol instance.
func New() *Protocol { return &Protocol{} }

// Version returns the s3 schema version.
func (p *Protocol) Version() scp.Version { return scp.VersionS3 }

// Encode marshals data to JSON after validating required s3 fields.
func (p *Protocol) Encode(data map[string]any) ([]byte, error) {
	if err := validate(data); err != nil {
		return nil, err
	}
	return json.Marshal(data)
}

// Decode unmarshals JSON bytes and validates the required s3 fields.
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

// Upgrade migrates a payload from a previous schema version to s3.
// Currently supports upgrading from s2 by injecting a default "version" field.
func (p *Protocol) Upgrade(from scp.Version, data map[string]any) (map[string]any, error) {
	switch from {
	case scp.VersionS2:
		upgraded := make(map[string]any, len(data)+1)
		for k, v := range data {
			upgraded[k] = v
		}
		if _, ok := upgraded["version"]; !ok {
			upgraded["version"] = string(scp.VersionS3)
		}
		return upgraded, nil
	default:
		return nil, fmt.Errorf("s3: upgrade from %q is not supported", from)
	}
}

func validate(data map[string]any) error {
	for _, f := range requiredFields {
		if _, ok := data[f]; !ok {
			return fmt.Errorf("s3: missing required field %q", f)
		}
	}
	return nil
}
