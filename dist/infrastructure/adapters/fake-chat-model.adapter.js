"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeChatModelAdapter = void 0;
const benefit_type_enum_1 = require("../../domain/enums/benefit-type.enum");
const offer_type_enum_1 = require("../../domain/enums/offer-type.enum");
const parseProposalId = (message) => {
    if (!message) {
        return undefined;
    }
    const match = message.match(/\b([A-Za-z0-9\-_]*\d+[A-Za-z0-9\-_]*)\b/);
    return match ? match[1].toUpperCase() : undefined;
};
const parseOfferType = (message) => {
    if (!message) {
        return undefined;
    }
    const normalized = message.toLocaleLowerCase();
    if (normalized.includes('oferta a') || normalized.includes('tipo a')) {
        return offer_type_enum_1.OfferType.A;
    }
    if (normalized.includes('oferta b') || normalized.includes('tipo b')) {
        return offer_type_enum_1.OfferType.B;
    }
    if (normalized.includes('oferta c') || normalized.includes('tipo c')) {
        return offer_type_enum_1.OfferType.C;
    }
    return undefined;
};
const parseBenefits = (message) => {
    const benefits = [];
    if (!message) {
        return benefits;
    }
    const normalized = message.toLocaleLowerCase();
    if (normalized.includes('cashback')) {
        benefits.push(benefit_type_enum_1.BenefitType.CASHBACK);
    }
    if (normalized.includes('points') || normalized.includes('puntos') || normalized.includes('pontos')) {
        benefits.push(benefit_type_enum_1.BenefitType.POINTS);
    }
    if (normalized.includes('travel') ||
        normalized.includes('viaje') ||
        normalized.includes('viagem') ||
        normalized.includes('insurance')) {
        benefits.push(benefit_type_enum_1.BenefitType.TRAVEL_INSURANCE);
    }
    if (normalized.includes('vip') || normalized.includes('lounge')) {
        benefits.push(benefit_type_enum_1.BenefitType.VIP_LOUNGE);
    }
    return benefits;
};
class FakeChatModelAdapter {
    async interpretIntent(request) {
        const userMessage = request.userMessage ?? '';
        const message = userMessage.toLocaleLowerCase();
        const proposalId = request.proposalId ??
            request.parameters?.proposalId ??
            parseProposalId(userMessage);
        const hasHelpIntent = /opciones|opcoes|opções|menu|ajuda|ayuda|que puedes hacer|qué puedes hacer|help|mostrar opciones/i.test(message);
        const hasCreateIntent = /solicitar.*cr[eé]dito|crear.*cr[eé]dito|quiero.*cr[eé]dito|aplicar.*cr[eé]dito|solicitar.*cr[ée]dito|cri(ar|ar).*cr[ée]dito|quero.*cr[ée]dito|aplicar.*cr[ée]dito|quero.*cart[oó]o/i.test(userMessage);
        const hasListIntent = /todas las propuestas|todas as propostas|listar propostas|listar propuestas|lista de propostas|lista de propuestas/i.test(message);
        const hasStatusIntent = /estado|status|situaci[oó]n|situa[cç][aã]o|consulta.*propuesta|consulta.*proposta/i.test(message);
        const hasValidateOfferIntent = /validar.*oferta|elegibilidad|oferta.*válida|oferta.*válida|validar.*oferta|elegibilidade/i.test(message);
        const hasValidateBenefitsIntent = /(?:validar|validación|validacíon).*beneficios|beneficios.*(?:validar|validación|validacíon)|validar.*benef[ií]cios|benef[ií]cios.*validar/i.test(message);
        const hasSubmitIntent = /enviar.*propuesta|presentar.*propuesta|submit|finalizar.*propuesta|enviar.*proposta|finalizar.*proposta/i.test(message);
        const hasCreateCardIntent = /crear.*tarjeta|generar.*tarjeta|emitir.*tarjeta|tarjeta.*cuenta|criar.*cart[aã]o|gerar.*cart[aã]o|emitir.*cart[aã]o/i.test(message);
        const hasActivateBenefitsIntent = /(?:activar|ativar).*beneficios|beneficios.*(?:activar|ativar)|(?:activar|ativar).*benef[ií]cios|benef[ií]cios.*(?:activar|ativar)/i.test(message);
        const hasExplainIntent = /explicar|detalle|por qu[eé]|raz[oó]n|resumen|detalhe|por que|raz[oó]es|resumo/i.test(message);
        if (hasHelpIntent) {
            const options = request.availableTools
                .map((tool) => `- ${tool.name}: ${tool.description}`)
                .join('\n');
            return {
                toolName: 'none',
                toolInput: {},
                assistantMessage: `Estas são as opções disponíveis:\n${options}\nIndique qual deseja usar e eu o guiarei com os dados necessários.`,
            };
        }
        if (hasCreateIntent) {
            const offerType = parseOfferType(request.userMessage) || request.parameters?.offerType;
            const selectedBenefits = parseBenefits(request.userMessage).length
                ? parseBenefits(request.userMessage)
                : (request.parameters?.selectedBenefits ?? []);
            const customerProfile = request.parameters?.customerProfile ?? {};
            const proposal = proposalId ?? String(Date.now());
            return {
                toolName: 'create_proposal',
                toolInput: {
                    proposalId: proposal,
                    customerProfile,
                    offerType,
                    selectedBenefits,
                },
                assistantMessage: 'Perfeito, vamos iniciar a solicitação de crédito. Vou pedir os dados necessários um por um.',
            };
        }
        if (hasListIntent) {
            return {
                toolName: 'list_proposals',
                toolInput: {},
                assistantMessage: 'Consultando o resumo das propostas cadastradas.',
            };
        }
        if (hasStatusIntent) {
            return {
                toolName: proposalId ? 'check_status' : 'none',
                toolInput: { proposalId },
                assistantMessage: proposalId
                    ? 'Consultando o status da sua proposta.'
                    : 'Preciso do ID da proposta para consultar seu status. Por favor, informe-o.',
            };
        }
        if (hasValidateOfferIntent) {
            return {
                toolName: proposalId ? 'validate_offer' : 'none',
                toolInput: { proposalId },
                assistantMessage: proposalId
                    ? 'Validando a elegibilidade da oferta para a proposta indicada.'
                    : 'Por favor, informe o ID da proposta que deseja validar.',
            };
        }
        if (hasValidateBenefitsIntent) {
            const selectedBenefits = parseBenefits(request.userMessage).length
                ? parseBenefits(request.userMessage)
                : (request.parameters?.selectedBenefits ?? []);
            return {
                toolName: proposalId ? 'validate_benefits' : 'none',
                toolInput: {
                    proposalId,
                    selectedBenefits,
                },
                assistantMessage: proposalId
                    ? 'Validando a seleção de benefícios para essa proposta.'
                    : 'Preciso do ID da proposta para validar os benefícios.',
            };
        }
        if (hasSubmitIntent) {
            return {
                toolName: proposalId ? 'submit_proposal' : 'none',
                toolInput: { proposalId },
                assistantMessage: proposalId
                    ? 'Enviando a proposta.'
                    : 'Por favor, informe o ID da proposta que deseja enviar.',
            };
        }
        if (hasCreateCardIntent) {
            return {
                toolName: proposalId ? 'create_card_account' : 'none',
                toolInput: { proposalId },
                assistantMessage: proposalId
                    ? 'Solicitando a criação do cartão para essa proposta.'
                    : 'Preciso do ID da proposta para criar a conta do cartão.',
            };
        }
        if (hasActivateBenefitsIntent) {
            return {
                toolName: proposalId ? 'activate_benefits' : 'none',
                toolInput: { proposalId },
                assistantMessage: proposalId
                    ? 'Ativando os benefícios para o seu cartão.'
                    : 'Informe o ID da proposta para ativar os benefícios.',
            };
        }
        if (hasExplainIntent) {
            return {
                toolName: proposalId ? 'explain_proposal' : 'none',
                toolInput: { proposalId },
                assistantMessage: proposalId
                    ? 'Vou explicar o status e as ações da sua proposta.'
                    : 'Informe o ID da proposta para que eu possa explicá-la.',
            };
        }
        return {
            toolName: 'none',
            toolInput: {},
            assistantMessage: 'Posso ajudá-lo a solicitar um crédito, consultar o status de uma proposta, validar a oferta, validar benefícios, enviar a proposta, criar um cartão ou ativar benefícios. O que deseja fazer?',
        };
    }
}
exports.FakeChatModelAdapter = FakeChatModelAdapter;
