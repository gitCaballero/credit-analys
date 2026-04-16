import { ChatAssistantModelAdapter, ChatAssistantModelRequest, ChatAssistantModelResponse } from '../../application/ports/chat-assistant.adapter';
import { BenefitType } from '../../domain/enums/benefit-type.enum';
import { OfferType } from '../../domain/enums/offer-type.enum';

const parseProposalId = (message: string): string | undefined => {
  const match = message.match(/\b([A-Za-z0-9\-_]{6,})\b/);
  return match ? match[1].toUpperCase() : undefined;
};

const parseOfferType = (message: string): OfferType | undefined => {
  if (message.includes('oferta a') || message.includes('tipo a') || message.includes('oferta A') || message.includes('tipo A')) {
    return OfferType.A;
  }
  if (message.includes('oferta b') || message.includes('tipo b') || message.includes('oferta B') || message.includes('tipo B')) {
    return OfferType.B;
  }
  if (message.includes('oferta c') || message.includes('tipo c') || message.includes('oferta C') || message.includes('tipo C')) {
    return OfferType.C;
  }
  return undefined;
};

const parseBenefits = (message: string): BenefitType[] => {
  const benefits: BenefitType[] = [];
  if (message.includes('cashback')) {
    benefits.push(BenefitType.CASHBACK);
  }
  if (message.includes('points') || message.includes('puntos')) {
    benefits.push(BenefitType.POINTS);
  }
  if (message.includes('travel') || message.includes('viaje') || message.includes('insurance')) {
    benefits.push(BenefitType.TRAVEL_INSURANCE);
  }
  if (message.includes('vip') || message.includes('lounge')) {
    benefits.push(BenefitType.VIP_LOUNGE);
  }
  return benefits;
};

export class FakeChatModelAdapter implements ChatAssistantModelAdapter {
  async interpretIntent(request: ChatAssistantModelRequest): Promise<ChatAssistantModelResponse> {
    const message = request.userMessage.toLowerCase();
    const proposalId = request.proposalId ?? parseProposalId(request.userMessage);
    const hasHelpIntent = /opciones|menu|ayuda|que puedes hacer|qué puedes hacer|help|mostrar opciones/i.test(message);
    const hasCreateIntent = /solicitar.*cr[eé]dito|crear.*cr[eé]dito|quiero.*cr[eé]dito|aplicar.*cr[eé]dito/i.test(request.userMessage);
    const hasStatusIntent = /estado|status|situaci[oó]n|consulta.*propuesta/i.test(message);
    const hasValidateOfferIntent = /validar.*oferta|elegibilidad|oferta.*válida/i.test(message);
    const hasValidateBenefitsIntent = /validar.*beneficios|beneficios.*validar|beneficios/i.test(message);
    const hasSubmitIntent = /enviar.*propuesta|presentar.*propuesta|submit|finalizar.*propuesta/i.test(message);
    const hasCreateCardIntent = /crear.*tarjeta|generar.*tarjeta|emitir.*tarjeta|tarjeta.*cuenta/i.test(message);
    const hasActivateBenefitsIntent = /activar.*beneficios|beneficios.*activar/i.test(message);
    const hasExplainIntent = /explicar|detalle|por qu[eé]|raz[oó]n|resumen/i.test(message);

    if (hasHelpIntent) {
      const options = request.availableTools
        .map((tool) => `- ${tool.name}: ${tool.description}`)
        .join('\n');
      return {
        toolName: 'none',
        toolInput: {},
        assistantMessage: `Estas son las opciones disponibles:\n${options}\nIndica cuál deseas usar y te guiaré con los datos necesarios.`,
      };
    }

    if (hasCreateIntent) {
      const offerType = parseOfferType(request.userMessage) || (request.parameters?.offerType as OfferType | undefined);
      const selectedBenefits = parseBenefits(request.userMessage).length
        ? parseBenefits(request.userMessage)
        : ((request.parameters?.selectedBenefits as BenefitType[]) ?? []);
      const customerProfile = (request.parameters?.customerProfile as Record<string, unknown> | undefined) ?? {};
      const proposal = proposalId ?? String(Date.now());

      return {
        toolName: 'create_proposal',
        toolInput: {
          proposalId: proposal,
          customerProfile,
          offerType,
          selectedBenefits,
        },
        assistantMessage: 'Perfecto, comencemos la solicitud de crédito. Te iré pidiendo los datos necesarios uno por uno.',
      };
    }

    if (hasStatusIntent) {
      return {
        toolName: proposalId ? 'check_status' : 'none',
        toolInput: { proposalId },
        assistantMessage: proposalId
          ? 'Consulto el estado de tu propuesta.'
          : 'Necesito el ID de la propuesta para consultar su estado. Por favor, indícalo.',
      };
    }

    if (hasValidateOfferIntent) {
      return {
        toolName: proposalId ? 'validate_offer' : 'none',
        toolInput: { proposalId },
        assistantMessage: proposalId
          ? 'Valido la elegibilidad de la oferta para la propuesta indicada.'
          : 'Por favor indícame el ID de la propuesta que deseas validar.',
      };
    }

    if (hasValidateBenefitsIntent) {
      const selectedBenefits = parseBenefits(request.userMessage).length
        ? parseBenefits(request.userMessage)
        : ((request.parameters?.selectedBenefits as BenefitType[]) ?? []);
      return {
        toolName: proposalId ? 'validate_benefits' : 'none',
        toolInput: {
          proposalId,
          selectedBenefits,
        },
        assistantMessage: proposalId
          ? 'Valido la selección de beneficios para esa propuesta.'
          : 'Necesito el ID de la propuesta para validar los beneficios.',
      };
    }

    if (hasSubmitIntent) {
      return {
        toolName: proposalId ? 'submit_proposal' : 'none',
        toolInput: { proposalId },
        assistantMessage: proposalId
          ? 'Procedo a enviar la propuesta.'
          : 'Por favor dame el ID de la propuesta que deseas enviar.',
      };
    }

    if (hasCreateCardIntent) {
      return {
        toolName: proposalId ? 'create_card_account' : 'none',
        toolInput: { proposalId },
        assistantMessage: proposalId
          ? 'Solicito la creación de la tarjeta para esa propuesta.'
          : 'Necesito el ID de la propuesta para crear la cuenta de tarjeta.',
      };
    }

    if (hasActivateBenefitsIntent) {
      return {
        toolName: proposalId ? 'activate_benefits' : 'none',
        toolInput: { proposalId },
        assistantMessage: proposalId
          ? 'Activo los beneficios para tu tarjeta.'
          : 'Indícame el ID de la propuesta para activar los beneficios.',
      };
    }

    if (hasExplainIntent) {
      return {
        toolName: proposalId ? 'explain_proposal' : 'none',
        toolInput: { proposalId },
        assistantMessage: proposalId
          ? 'Te explico el estado y acciones de tu propuesta.'
          : 'Dame el ID de la propuesta para que pueda explicarla.',
      };
    }

    return {
      toolName: 'none',
      toolInput: {},
      assistantMessage:
        'Puedo ayudarte a solicitar un crédito, consultar el estado de una propuesta, validar la oferta, validar beneficios, enviar una propuesta, crear una tarjeta o activar beneficios. ¿Qué deseas hacer?',
    };
  }
}
