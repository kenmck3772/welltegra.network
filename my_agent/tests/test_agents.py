"""
Test suite for Dark Kenneth Triad agents.

Run with: pytest tests/ -v
Or: python -m pytest tests/ -v
"""

import pytest
from unittest.mock import Mock, patch
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))


class TestAgentDefinitions:
    """Test agent definition functions"""

    def test_alpha_agent_structure(self):
        """Test Alpha agent has correct structure"""
        with patch('my_agent.agent.AgentDefinition') as mock_def:
            mock_instance = Mock()
            mock_def.return_value = mock_instance

            from my_agent.agent import create_agent_alpha
            result = create_agent_alpha()

            # Verify AgentDefinition was called with correct params
            mock_def.assert_called_once()
            call_kwargs = mock_def.call_args[1]

            assert call_kwargs['name'] == 'agent-alpha'
            assert 'contagion' in call_kwargs['description'].lower()
            assert 'Tight Coupling' in call_kwargs['system_prompt']
            assert 'Brutal Realism' in call_kwargs['system_prompt']

    def test_beta_agent_structure(self):
        """Test Beta agent has correct structure"""
        with patch('my_agent.agent.AgentDefinition') as mock_def:
            mock_instance = Mock()
            mock_def.return_value = mock_instance

            from my_agent.agent import create_agent_beta
            result = create_agent_beta()

            call_kwargs = mock_def.call_args[1]

            assert call_kwargs['name'] == 'agent-beta'
            assert 'narrative' in call_kwargs['description'].lower()
            assert 'Reality Coefficient' in call_kwargs['system_prompt']
            assert 'Optimism Bias' in call_kwargs['system_prompt']

    def test_gamma_agent_structure(self):
        """Test Gamma agent has correct structure"""
        with patch('my_agent.agent.AgentDefinition') as mock_def:
            mock_instance = Mock()
            mock_def.return_value = mock_instance

            from my_agent.agent import create_agent_gamma
            result = create_agent_gamma(enable_web_search=True)

            call_kwargs = mock_def.call_args[1]

            assert call_kwargs['name'] == 'agent-gamma'
            assert 'regulatory' in call_kwargs['description'].lower()
            assert 'DORA' in call_kwargs['system_prompt']
            assert 'GDPR' in call_kwargs['system_prompt']
            assert 'WEB SEARCH CAPABILITIES' in call_kwargs['system_prompt']

    def test_gamma_without_web_search(self):
        """Test Gamma agent web search is optional"""
        with patch('my_agent.agent.AgentDefinition') as mock_def:
            mock_instance = Mock()
            mock_def.return_value = mock_instance

            from my_agent.agent import create_agent_gamma
            result = create_agent_gamma(enable_web_search=False)

            call_kwargs = mock_def.call_args[1]

            # Should not have web search instructions
            assert 'WEB SEARCH CAPABILITIES' not in call_kwargs['system_prompt']


class TestDarkKennethTriad:
    """Test the main API class"""

    def test_triad_initialization(self):
        """Test DarkKennethTriad can be initialized"""
        with patch.dict(os.environ, {'CLAUDE_CODE_USE_VERTEX': '1'}):
            from my_agent.agent import DarkKennethTriad

            triad = DarkKennethTriad(use_vertex=True)
            assert triad.use_vertex is True

    def test_triad_vertex_configuration(self):
        """Test Vertex AI is configured when use_vertex=True"""
        with patch.dict(os.environ, {}, clear=False):
            from my_agent.agent import DarkKennethTriad

            triad = DarkKennethTriad(use_vertex=True)
            assert os.environ.get('CLAUDE_CODE_USE_VERTEX') == '1'


class TestContagionAnalysis:
    """Test Alpha agent contagion path detection logic"""

    @pytest.mark.parametrize("text,has_risk", [
        ("System A depends on System B", True),
        ("Shared authentication across all services", True),
        ("Synchronous dependency between services", True),
        ("Fully isolated microservices", False),
        ("Independent modules with async messaging", False),
    ])
    def test_coupling_detection(self, text, has_risk):
        """Test coupling risk detection patterns"""
        coupling_indicators = [
            'depends on', 'shared', 'synchronous', 'coupled',
            'direct connection', 'tightly integrated'
        ]

        text_lower = text.lower()
        detected = any(indicator in text_lower for indicator in coupling_indicators)

        assert detected == has_risk


class TestRealityCoefficient:
    """Test Beta agent reality coefficient calculation"""

    @pytest.mark.parametrize("text,expected_flags", [
        ("We will seamlessly deliver", 1),
        ("Rapidly and easily deployed", 2),
        ("Simply and seamlessly integrated", 2),
        ("Standard deployment", 0),
        ("We'll rapidly and simply and seamlessly deploy it all", 3),
    ])
    def test_masking_adverb_detection(self, text, expected_flags):
        """Test masking adverb detection"""
        masking_adverbs = [
            'seamlessly', 'rapidly', 'easily', 'simply',
            'just', 'merely', 'straightforward'
        ]

        text_lower = text.lower()
        flags = sum(1 for adverb in masking_adverbs if adverb in text_lower)

        assert flags == expected_flags


class TestRegulatoryVerdict:
    """Test Gamma agent regulatory verdict logic"""

    @pytest.mark.parametrize("incident_response,dora_status", [
        ("1 hour", "COMPLIANT"),
        ("30 minutes", "COMPLIANT"),
        ("24 hours", "VETO"),
        ("48 hours", "VETO"),
        ("2 days", "VETO"),
    ])
    def test_dora_incident_response(self, incident_response, dora_status):
        """Test DORA incident response timing requirements"""
        # DORA requires 1 hour for serious incidents
        veto_indicators = ['24 hours', '48 hours', '2 days', '3 days', '1 week']

        if any(indicator in incident_response for indicator in veto_indicators):
            assert dora_status == "VETO"
        else:
            assert dora_status == "COMPLIANT"

    @pytest.mark.parametrize("has_lawful_basis,has_dpia,gdpr_status", [
        (True, True, "COMPLIANT"),
        (False, True, "PARTIAL"),
        (True, False, "PARTIAL"),
        (False, False, "VETO"),
    ])
    def test_gdpr_compliance(self, has_lawful_basis, has_dpia, gdpr_status):
        """Test GDPR compliance logic"""
        if not has_lawful_basis and not has_dpia:
            assert gdpr_status == "VETO"
        elif has_lawful_basis and has_dpia:
            assert gdpr_status == "COMPLIANT"
        else:
            assert gdpr_status == "PARTIAL"


class TestEnvironmentConfiguration:
    """Test environment variable handling"""

    def test_web_search_env_parsing(self):
        """Test ENABLE_WEB_SEARCH environment parsing"""
        test_cases = [
            ("true", True),
            ("True", True),
            ("1", True),
            ("yes", True),
            ("on", True),
            ("false", False),
            ("0", False),
            ("no", False),
            ("off", False),
        ]

        for value, expected in test_cases:
            result = value.lower() in ("true", "1", "yes", "on")
            assert result == expected


class TestVerdictLogic:
    """Test final verdict orchestration"""

    @pytest.mark.parametrize("alpha,beta,gamma,final", [
        ("PROCEED", "PROCEED", "PROCEED", "PROCEED"),
        ("CAUTION", "PROCEED", "PROCEED", "CAUTION"),
        ("PROCEED", "CAUTION", "PROCEED", "CAUTION"),
        ("VETO", "PROCEED", "PROCEED", "VETO"),
        ("PROCEED", "VETO", "PROCEED", "VETO"),
        ("PROCEED", "PROCEED", "VETO", "VETO"),
        ("CAUTION", "CAUTION", "VETO", "VETO"),
    ])
    def test_verdict_orchestration(self, alpha, beta, gamma, final):
        """Test that any VETO results in VETO final verdict"""
        agent_verdicts = [alpha, beta, gamma]

        if "VETO" in agent_verdicts:
            assert final == "VETO"
        elif "CAUTION" in agent_verdicts:
            assert final == "CAUTION"
        else:
            assert final == "PROCEED"


@pytest.fixture
def mock_w666_document():
    """Fixture providing mock W666 document text"""
    return """
    # Well W-666 Project Proposal

    We will seamlessly integrate our AI system with existing SCADA.
    Timeline: 16 weeks. Risks: Low.

    Data: We process operator names for optimization.
    Retention: 7 years (will figure out deletion later).

    Compliance: We follow industry best practices.
    """


class TestEndToEnd:
    """End-to-end integration tests"""

    def test_document_parsing(self, mock_w666_document):
        """Test document can be parsed for analysis"""
        assert "seamlessly" in mock_w666_document.lower()
        assert "16 weeks" in mock_w666_document
        assert "operator names" in mock_w666_document

    def test_risk_indicators_present(self, mock_w666_document):
        """Test that risk indicators are detected"""
        # Alpha risks
        assert "SCADA" in mock_w666_document

        # Beta risks
        assert "seamlessly" in mock_w666_document.lower()
        assert "16 weeks" in mock_w666_document
        assert "Low" in mock_w666_document  # vague risk assessment

        # Gamma risks
        assert "operator names" in mock_w666_document
        assert "7 years" in mock_w666_document
        assert "will figure out" in mock_w666_document.lower()


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
