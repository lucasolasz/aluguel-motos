'use client'

import { Loader2 } from 'lucide-react'
import { AddressForm } from './_components/address-form'
import { AddressSelect } from './_components/address-select'
import { CardForm } from './_components/card-form'
import { CardValidationDialog } from './_components/card-validation-dialog'
import { CardSelectionList } from './_components/card-selection-list'
import { CustomerDataFields } from './_components/customer-data-fields'
import { TermsAcceptance } from './_components/terms-acceptance'
import type { Step5Controller } from './use-step5'

interface DadosStepProps {
  controller: Step5Controller
}

export function DadosStep({ controller }: DadosStepProps) {
  const {
    customerData,
    step5Phase,
    userCards,
    userAddresses,
    selectedCardId,
    setSelectedCardId,
    termsAccepted,
    setTermsAccepted,
    selectedAddressId,
    setSelectedAddressId,
    validationDialogOpen,
    validationStatus,
    cardError,
    confirmValidation,
    closeValidationDialog,
    addressSaving,
    addressAssociating,
    cepLoading,
    cidadesLoading,
    cidades,
    newCardData,
    setNewCardData,
    newAddressData,
    setNewAddressData,
    handleValidarECadastrarCartao,
    handleCepBlur,
    handleEstadoChange,
    handleCidadeChange,
    handleCadastrarEndereco,
    handleAddressSelectContinue,
    isCardFormValid,
    isAddressFormValid,
    requestAddressForCard,
    backFromCardForm,
    goToCardForm,
    goToAddressForm,
    backFromAddressForm,
  } = controller

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Confirmação de Dados</h2>
        <p className="mt-1 text-muted-foreground">Seus dados e informações de pagamento</p>
      </div>

      {step5Phase === 'loading' && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {step5Phase !== 'loading' && <CustomerDataFields data={customerData} />}

      {step5Phase === 'card-form' && (
        <CardForm
          data={newCardData}
          onChange={setNewCardData}
          onSubmit={handleValidarECadastrarCartao}
          isValid={isCardFormValid}
          onBack={userCards.length > 0 ? backFromCardForm : undefined}
        />
      )}

      {step5Phase === 'address-select' && (
        <AddressSelect
          addresses={userAddresses}
          selectedAddressId={selectedAddressId}
          onSelectedAddressIdChange={setSelectedAddressId}
          onGoToAddressForm={goToAddressForm}
          onContinue={handleAddressSelectContinue}
          associating={addressAssociating}
        />
      )}

      {step5Phase === 'address-form' && (
        <AddressForm
          data={newAddressData}
          onChange={setNewAddressData}
          onCepBlur={handleCepBlur}
          onEstadoChange={handleEstadoChange}
          onCidadeChange={handleCidadeChange}
          onSubmit={handleCadastrarEndereco}
          onBack={backFromAddressForm}
          cepLoading={cepLoading}
          cidadesLoading={cidadesLoading}
          cidades={cidades}
          isValid={isAddressFormValid}
          saving={addressSaving}
        />
      )}

      {step5Phase === 'selection' && (
        <>
          <CardSelectionList
            cards={userCards}
            selectedCardId={selectedCardId}
            onSelectedCardIdChange={setSelectedCardId}
            onAddNewCard={goToCardForm}
            onAddAddressForCard={requestAddressForCard}
          />
          <TermsAcceptance accepted={termsAccepted} onChange={setTermsAccepted} />
        </>
      )}

      <CardValidationDialog
        open={validationDialogOpen}
        status={validationStatus}
        errorMessage={cardError}
        onConfirm={confirmValidation}
        onClose={closeValidationDialog}
      />
    </div>
  )
}
