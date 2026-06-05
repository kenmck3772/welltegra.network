"""
Tests for verify_portal.py - GPG Verification Portal

Tests cover:
- Helper function unit tests
- API endpoint integration tests
- Edge cases and error handling
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime


class TestForensicFindings:
    """Tests for extract_forensic_findings function"""

    def test_extract_well_name(self):
        """Test extraction of well name from report"""
        from verify_portal import extract_forensic_findings

        report_data = b"Well: ALPHA-01\nField: Thistle\n"
        findings = extract_forensic_findings(report_data)

        assert findings.well_name == "ALPHA-01"

    def test_extract_field_name(self):
        """Test extraction of field name from report"""
        from verify_portal import extract_forensic_findings

        report_data = b"Well: TEST-01\nField: Magnus North\n"
        findings = extract_forensic_findings(report_data)

        assert findings.field == "Magnus North"

    def test_extract_operator(self):
        """Test extraction of operator from report"""
        from verify_portal import extract_forensic_findings

        report_data = b"Operator: WellTegra Operations\n"
        findings = extract_forensic_findings(report_data)

        assert findings.operator == "WellTegra Operations"

    def test_extract_depths(self):
        """Test extraction of depth values from report"""
        from verify_portal import extract_forensic_findings

        report_data = b"""
        Original Depth (KB): 12,500 ft
        Corrected Depth (GL): 12,475 ft
        """
        findings = extract_forensic_findings(report_data)

        assert findings.original_depth_kb == 12500.0
        assert findings.corrected_depth_gl == 12475.0

    def test_extract_datum_shift(self):
        """Test extraction of datum shift from report"""
        from verify_portal import extract_forensic_findings

        report_data = b"Datum Shift Detected: 25 ft\n"
        findings = extract_forensic_findings(report_data)

        assert findings.datum_shift_detected == 25.0

    def test_extract_thermodynamic_validation_pass(self):
        """Test extraction of thermodynamic validation - PASS case"""
        from verify_portal import extract_forensic_findings

        report_data = b"Thermodynamic Validation: PASS - Temperature within limits\n"
        findings = extract_forensic_findings(report_data)

        assert findings.thermodynamic_validation == "PASS"

    def test_extract_thermodynamic_validation_fail(self):
        """Test extraction of thermodynamic validation - FAIL case"""
        from verify_portal import extract_forensic_findings

        report_data = b"Thermodynamic Validation: FAIL - Anomalous pressure detected\n"
        findings = extract_forensic_findings(report_data)

        assert findings.thermodynamic_validation == "FAIL"

    def test_extract_formation_marker_pass(self):
        """Test extraction of formation marker correlation - PASS case"""
        from verify_portal import extract_forensic_findings

        report_data = b"Formation Marker Correlation: PASS - All markers matched\n"
        findings = extract_forensic_findings(report_data)

        assert findings.formation_marker_correlation == "PASS"

    def test_extract_empty_report(self):
        """Test handling of empty report data"""
        from verify_portal import extract_forensic_findings

        report_data = b""
        findings = extract_forensic_findings(report_data)

        assert findings.well_name is None
        assert findings.field is None

    def test_extract_malformed_report(self):
        """Test handling of malformed report data"""
        from verify_portal import extract_forensic_findings

        report_data = b"Random text without expected fields"
        findings = extract_forensic_findings(report_data)

        # Should not raise exception, just return empty findings
        assert findings is not None


class TestImportPublicKey:
    """Tests for import_public_key function"""

    @patch('verify_portal.gpg')
    def test_successful_key_import(self, mock_gpg):
        """Test successful GPG key import"""
        from verify_portal import import_public_key

        mock_result = Mock()
        mock_result.fingerprints = ['8447040982A2FBC547AFE3375AF1E97DBD6CAE7F']
        mock_gpg.import_keys.return_value = mock_result

        result = import_public_key("-----BEGIN PGP PUBLIC KEY BLOCK-----...")

        assert result is True
        mock_gpg.import_keys.assert_called_once()

    @patch('verify_portal.gpg')
    def test_failed_key_import(self, mock_gpg):
        """Test failed GPG key import"""
        from verify_portal import import_public_key

        mock_result = Mock()
        mock_result.fingerprints = []
        mock_gpg.import_keys.return_value = mock_result

        result = import_public_key("invalid key data")

        assert result is False

    @patch('verify_portal.gpg')
    def test_exception_handling(self, mock_gpg):
        """Test exception handling during key import"""
        from verify_portal import import_public_key

        mock_gpg.import_keys.side_effect = Exception("GPG error")

        result = import_public_key("-----BEGIN PGP PUBLIC KEY BLOCK-----...")

        assert result is False


class TestVerifyGPGSignature:
    """Tests for verify_gpg_signature function"""

    @patch('verify_portal.gpg')
    @patch('tempfile.NamedTemporaryFile')
    def test_valid_inline_signature(self, mock_tempfile, mock_gpg):
        """Test verification of valid inline signature"""
        from verify_portal import verify_gpg_signature

        # Setup mock temp file
        mock_file = MagicMock()
        mock_file.__enter__ = Mock(return_value=mock_file)
        mock_file.__exit__ = Mock(return_value=False)
        mock_file.name = '/tmp/test.asc'
        mock_tempfile.return_value = mock_file

        # Setup mock verification result
        mock_verified = Mock()
        mock_verified.valid = True
        mock_verified.fingerprint = '8447040982A2FBC547AFE3375AF1E97DBD6CAE7F'
        mock_verified.key_id = '5AF1E97DBD6CAE7F'
        mock_verified.username = 'Kenneth McKenzie'
        mock_verified.timestamp = datetime.now().timestamp()
        mock_verified.trust_text = 'TRUST_ULTIMATE'
        mock_verified.status = 'signature valid'
        mock_gpg.verify_file.return_value = mock_verified

        with patch('builtins.open', MagicMock()):
            with patch('os.unlink'):
                result = verify_gpg_signature(b"signed report content")

        assert result['valid'] is True
        assert result['fingerprint'] == '8447040982A2FBC547AFE3375AF1E97DBD6CAE7F'

    @patch('verify_portal.gpg')
    @patch('tempfile.NamedTemporaryFile')
    def test_invalid_signature(self, mock_tempfile, mock_gpg):
        """Test verification of invalid signature"""
        from verify_portal import verify_gpg_signature

        mock_file = MagicMock()
        mock_file.__enter__ = Mock(return_value=mock_file)
        mock_file.__exit__ = Mock(return_value=False)
        mock_file.name = '/tmp/test.asc'
        mock_tempfile.return_value = mock_file

        mock_verified = Mock()
        mock_verified.valid = False
        mock_verified.fingerprint = None
        mock_verified.key_id = None
        mock_verified.username = None
        mock_verified.timestamp = None
        mock_verified.trust_text = None
        mock_verified.status = 'signature invalid'
        mock_gpg.verify_file.return_value = mock_verified

        with patch('builtins.open', MagicMock()):
            with patch('os.unlink'):
                result = verify_gpg_signature(b"unsigned content")

        assert result['valid'] is False


class TestConstants:
    """Tests for module constants"""

    def test_kenneth_mckenzie_fingerprint(self):
        """Test that the correct fingerprint is set"""
        from verify_portal import KENNETH_MCKENZIE_FINGERPRINT

        assert KENNETH_MCKENZIE_FINGERPRINT == "8447040982A2FBC547AFE3375AF1E97DBD6CAE7F"

    def test_kenneth_mckenzie_key_id(self):
        """Test that the correct key ID is set"""
        from verify_portal import KENNETH_MCKENZIE_KEY_ID

        assert KENNETH_MCKENZIE_KEY_ID == "0x5AF1E97DBD6CAE7F"


class TestPydanticModels:
    """Tests for Pydantic data models"""

    def test_forensic_findings_model(self):
        """Test ForensicFindings model"""
        from verify_portal import ForensicFindings

        findings = ForensicFindings(
            well_name="ALPHA-01",
            field="Thistle",
            operator="WellTegra",
            original_depth_kb=12500.0,
            corrected_depth_gl=12475.0,
            datum_shift_detected=25.0,
            thermodynamic_validation="PASS",
            formation_marker_correlation="PASS"
        )

        assert findings.well_name == "ALPHA-01"
        assert findings.datum_shift_detected == 25.0

    def test_signature_metadata_model(self):
        """Test SignatureMetadata model"""
        from verify_portal import SignatureMetadata

        metadata = SignatureMetadata(
            signed_by="Kenneth McKenzie",
            key_id="0x5AF1E97DBD6CAE7F",
            fingerprint="8447040982A2FBC547AFE3375AF1E97DBD6CAE7F",
            signature_date="2026-01-21T12:00:00",
            valid=True,
            trust_level="TRUST_ULTIMATE"
        )

        assert metadata.signed_by == "Kenneth McKenzie"
        assert metadata.valid is True

    def test_verification_result_model(self):
        """Test VerificationResult model"""
        from verify_portal import VerificationResult, SignatureMetadata

        sig_metadata = SignatureMetadata(
            signed_by="Kenneth McKenzie",
            key_id="0x5AF1E97DBD6CAE7F",
            fingerprint="8447040982A2FBC547AFE3375AF1E97DBD6CAE7F",
            signature_date="2026-01-21T12:00:00",
            valid=True
        )

        result = VerificationResult(
            signature_valid=True,
            report_filename="report.asc",
            signature_metadata=sig_metadata,
            warnings=[],
            errors=[]
        )

        assert result.signature_valid is True
        assert result.report_filename == "report.asc"


class TestAPIEndpoints:
    """Tests for FastAPI endpoints"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        from fastapi.testclient import TestClient
        from verify_portal import app
        return TestClient(app)

    def test_root_endpoint(self, client):
        """Test root endpoint returns service info"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "WellTegra /verify Portal"
        assert "engineer_of_record" in data

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

    def test_get_public_key(self, client):
        """Test public key endpoint"""
        response = client.get("/api/public-key")

        assert response.status_code == 200
        data = response.json()
        assert data["fingerprint"] == "8447040982A2FBC547AFE3375AF1E97DBD6CAE7F"
        assert "Kenneth McKenzie" in data["owner"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
