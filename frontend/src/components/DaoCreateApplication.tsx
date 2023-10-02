/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { Dao, DaoClient } from '../contracts/DaoClient'
import { useWallet } from '@txnlab/use-wallet'

/* Example usage
<DaoCreateApplication
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call createApplication"
  typedClient={typedClient}
  proposal={proposal}
/>
*/

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: DaoClient
}

const DaoCreateApplication = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [proposal, setProposal] = useState<string>('')

  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)
    console.log(`Calling createApplication`)
    await props.typedClient.create.createApplication(
      {
        proposal,
      },
      { sender },
    )
    setLoading(false)
  }

  return (
    <div>
      <input type="text" className="input input-bordered m-2" onChange={(e) => setProposal(e.currentTarget.value)} />
      <button className={props.buttonClass} onClick={callMethod}>
        {loading ? props.buttonLoadingNode || props.buttonNode : props.buttonNode}
      </button>
    </div>
  )
}

export default DaoCreateApplication
