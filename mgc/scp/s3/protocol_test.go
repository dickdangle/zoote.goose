package s3_test

import (
	"encoding/json"
	"testing"

	"github.com/dickdangle/zoote.goose/mgc/scp"
	"github.com/dickdangle/zoote.goose/mgc/scp/s3"
)

func TestVersion(t *testing.T) {
	p := s3.New()
	if got := p.Version(); got != scp.VersionS3 {
		t.Errorf("Version() = %q; want %q", got, scp.VersionS3)
	}
}

func TestEncodeDecode_RoundTrip(t *testing.T) {
	p := s3.New()
	input := map[string]any{"id": "42", "name": "goose", "version": "s3"}

	b, err := p.Encode(input)
	if err != nil {
		t.Fatalf("Encode() error: %v", err)
	}

	got, err := p.Decode(b)
	if err != nil {
		t.Fatalf("Decode() error: %v", err)
	}

	if got["id"] != input["id"] || got["name"] != input["name"] || got["version"] != input["version"] {
		t.Errorf("round-trip mismatch: got %v; want %v", got, input)
	}
}

func TestEncode_MissingVersionField(t *testing.T) {
	p := s3.New()
	_, err := p.Encode(map[string]any{"id": "1", "name": "goose"})
	if err == nil {
		t.Error("Encode() expected error for missing 'version', got nil")
	}
}

func TestDecode_MissingField(t *testing.T) {
	p := s3.New()
	b, _ := json.Marshal(map[string]any{"id": "1", "name": "goose"})
	_, err := p.Decode(b)
	if err == nil {
		t.Error("Decode() expected error for missing 'version', got nil")
	}
}

func TestDecode_InvalidJSON(t *testing.T) {
	p := s3.New()
	_, err := p.Decode([]byte("not json"))
	if err == nil {
		t.Error("Decode() expected error for invalid JSON, got nil")
	}
}

func TestUpgrade_FromS2(t *testing.T) {
	p := s3.New()
	s2Data := map[string]any{"id": "7", "name": "goose"}

	upgraded, err := p.Upgrade(scp.VersionS2, s2Data)
	if err != nil {
		t.Fatalf("Upgrade() error: %v", err)
	}

	if _, ok := upgraded["version"]; !ok {
		t.Error("Upgrade() should inject 'version' field")
	}
	if upgraded["id"] != s2Data["id"] || upgraded["name"] != s2Data["name"] {
		t.Error("Upgrade() should preserve existing fields")
	}

	// The upgraded payload should pass s3 validation.
	b, err := p.Encode(upgraded)
	if err != nil {
		t.Fatalf("Encode() after Upgrade() error: %v", err)
	}
	if _, err := p.Decode(b); err != nil {
		t.Fatalf("Decode() after Upgrade() error: %v", err)
	}
}

func TestUpgrade_FromS2_PreservesExistingVersion(t *testing.T) {
	p := s3.New()
	data := map[string]any{"id": "7", "name": "goose", "version": "custom"}

	upgraded, err := p.Upgrade(scp.VersionS2, data)
	if err != nil {
		t.Fatalf("Upgrade() error: %v", err)
	}
	if upgraded["version"] != "custom" {
		t.Errorf("Upgrade() should not overwrite existing 'version', got %v", upgraded["version"])
	}
}

func TestUpgrade_UnsupportedVersion(t *testing.T) {
	p := s3.New()
	_, err := p.Upgrade("s1", map[string]any{"id": "1", "name": "goose"})
	if err == nil {
		t.Error("Upgrade() expected error for unsupported version, got nil")
	}
}
