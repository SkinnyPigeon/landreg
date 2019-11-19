const NS = 'org.landreg';

/**
 * Unlock landTitle so that it can be sold
 * @param {org.landreg.UnlockLandTitle} tx = The transaction instance
 * @transaction
 */
async function unlockLandTitle(tx) {
    const landTitleRegistry = await getAssetRegistry(NS + '.LandTitle');

    if(tx.landTitle.forSale) {
        throw new Error(`Land Title with id ${tx.landTitle.getIdentifier()} is already unlocked for sale`);
    }

    tx.landTitle.forSale = true;
    await landTitleRegistry.update(tx.landTitle);
}

/**
 * Transfer Ownership between individuals
 * @param {org.landreg.TransferLandTitle} tx = The transaction instance
 * @transaction
 */
async function transferLandTitle(tx) {
    const landTitleRegistry = await getAssetRegistry(NS + '.LandTitle');
    const individualRegistry = await getParticipantRegistry(NS + '.Individual');

    if(!tx.landTitle.forSale) {
        throw new Error(`Land Title with id ${tx.landTitle.getIdentifier()} is not marked for sale`);
    }

    const newOwnerID = tx.newOwner.getIdentifier();
    const oldOwnerId = tx.landTitle.owner.getIdentifier();

    const newOwner = await individualRegistry.get(newOwnerID);

    if(newOwnerID === oldOwnerId) {
        throw new Error(`Land Title with id ${tx.landTitle.getIdentifier()} is already owned by ${oldOwnerId}`);
    }

    tx.landTitle.previousOwners.push(tx.landTitle.owner);
    tx.landTitle.owner = tx.newOwner;
    tx.landTitle.forSale = false;

    await landTitleRegistry.update(tx.landTitle);
}