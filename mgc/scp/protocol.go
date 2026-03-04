// Package scp defines the Schema Control Protocol interface for the Magic Goose Config (MGC) system.
// It supports multiple schema versions (s2, s3) for versioned configuration management.
package scp

// Version identifies the schema version of a protocol payload.
type Version string

const (
	// VersionS2 is schema version 2.
	VersionS2 Version = "s2"
	// VersionS3 is schema version 3.
	VersionS3 Version = "s3"
)

// Protocol defines the core interface for MGC SCP operations.
type Protocol interface {
	// Version returns the schema version implemented by this protocol.
	Version() Version

	// Encode serializes the given data according to the protocol schema.
	Encode(data map[string]any) ([]byte, error)

	// Decode deserializes the given bytes into a data map according to the protocol schema.
	Decode(b []byte) (map[string]any, error)
}

// Upgrader can migrate payloads from an older schema version to a newer one.
type Upgrader interface {
	// Upgrade converts the given data map from a previous schema version to the current one.
	Upgrade(from Version, data map[string]any) (map[string]any, error)
}
