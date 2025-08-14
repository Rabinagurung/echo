import { OrganizationList } from '@clerk/nextjs'

const OrgSelectionView = () => {
  return (
    <OrganizationList
           
            afterCreateOrganizationUrl="/"
            afterSelectOrganizationUrl="/"
            hidePersonal
            skipInvitationScreen
    />
  )
}

export default OrgSelectionView