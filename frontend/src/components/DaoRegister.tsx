/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { Dao, DaoClient } from '../contracts/DaoClient'
import { useWallet } from '@txnlab/use-wallet'
import algosdk from 'algosdk'
import * as algokit from '@algorandfoundation/algokit-utils'

/* Example usage
<DaoRegister
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call register"
  typedClient={typedClient}
  registeredASA={registeredASA}
/>
*/
type DaoRegisterArgs = Dao['methods']['register(asset)void']['argsObj']

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: DaoClient
  registeredASA: DaoRegisterArgs['registeredASA']
  algodClient: algosdk.Algodv2
}

const DaoRegister = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)
    console.log(`Calling register`)

    const registeredAsaOptInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: sender.addr,
      amount: 0,
      suggestedParams: await algokit.getTransactionParams(undefined, props.algodClient),
      assetIndex: Number(props.registeredASA),
    })

    await algokit.sendTransaction({ from: sender, transaction: registeredAsaOptInTxn }, props.algodClient)

    await props.typedClient.register(
      {
        registeredASA: props.registeredASA,
      },
      { sender, sendParams: { fee: algokit.microAlgos(3_000) } },
    )
    setLoading(false)
  }

  return (
    <button className={props.buttonClass} onClick={callMethod}>
      {loading ? props.buttonLoadingNode || props.buttonNode : props.buttonNode}
    </button>
  )
}

export default DaoRegister
