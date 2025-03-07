'use client'

import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { 
    getPrescriptionsByPharmacy,
    getRole,
    getPrescriptionfromId,
    orderPrescription,
    acceptPrescriptionByPharmacy,
    setInventory,
    updateInventory,
    updatePharmacyInventory,
    getInventoryForPharmacy
} from '@/context/prescriptionServices'
import { toast } from 'sonner'
import { Loader2, ClipboardList, Pill, Store, Check, ShoppingBag, Calendar, Plus, RefreshCw } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger,
    Badge,
    Button,
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader,
    CardTitle,
    Input,
    Label,
    Separator,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,

} from "@/components/ui"
import { useRouter } from 'next/navigation'

const PharmacyPage = () => {
    const [prescriptionIds, setPrescriptionIds] = useState([])
    const [prescriptionDetails, setPrescriptionDetails] = useState({})
    const [loading, setLoading] = useState({
        prescriptions: false,
        details: new Set(),
        accepting: null,
        ordering: null,
        inventory: false,
        adding: false,
        updating: null
    })
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [inventory, setInventoryState] = useState([])
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [newDrugs, setNewDrugs] = useState([{ drugId: '', stock: '', expiration: '' }])

    const { address, isConnected } = useAccount()
    const router = useRouter()

    useEffect(() => {
        if (!isConnected || !address) return;

        const getRolenPrint = async () => {
            try {
                const roleNo = await getRole(address);
                switch (roleNo) {
                    case 0:
                        router.push("/login");
                        break;
                    case 1:
                        router.push("/doctor");
                        break;
                    case 2:
                        router.push("/patient");
                        break;
                    case 4:
                        router.push("/company");
                        break;
                }
            } catch (error) {
                console.error("Error fetching role:", error);
            }
        };

        getRolenPrint();
    }, [isConnected, address]);

    useEffect(() => {
        if (address) {
            fetchInventory()
        }
    }, [address])

    const fetchPrescriptionDetails = async (prescriptionId) => {
        try {
            setLoading(prev => ({
                ...prev,
                details: new Set([...prev.details, prescriptionId])
            }))
            
            const details = await getPrescriptionfromId(prescriptionId)
            setPrescriptionDetails(prev => ({
                ...prev,
                [prescriptionId]: details
            }))
        } catch (error) {
            console.error(`Error fetching details for prescription ${prescriptionId}:`, error)
            toast.error(`Failed to fetch details for prescription ${prescriptionId}`)
        } finally {
            setLoading(prev => ({
                ...prev,
                details: new Set([...prev.details].filter(id => id !== prescriptionId))
            }))
        }
    }

    const handleViewDetails = (prescriptionId) => {
        setSelectedPrescriptionId(prescriptionId)
        setShowDetailsDialog(true)
    }

    const handleOrderPrescription = async (prescriptionId) => {
        try {
            setLoading(prev => ({ ...prev, ordering: prescriptionId }))
            await orderPrescription(prescriptionId)
            toast.success("Prescription ordered successfully")
            
            // Refresh the prescription details
            await fetchPrescriptionDetails(prescriptionId)
        } catch (error) {
            console.error("Error ordering prescription:", error)
            toast.error("Failed to order prescription")
        } finally {
            setLoading(prev => ({ ...prev, ordering: null }))
        }
    }

    const getPendingPrescriptionsCount = () => {
        return Object.values(prescriptionDetails).filter(p => !p?.accepted && !p?.ordered).length
    }

    const getAcceptedPrescriptionsCount = () => {
        return Object.values(prescriptionDetails).filter(p => p?.accepted && !p?.ordered).length
    }

    const getOrderedPrescriptionsCount = () => {
        return Object.values(prescriptionDetails).filter(p => p?.ordered).length
    }

    const isLoadingDetails = (prescriptionId) => {
        return loading.details.has(prescriptionId)
    }

    const getStatusBadge = (details) => {
        if (!details) return null;
        if (details.ordered) {
            return <Badge variant="default" className="bg-green-500">Ordered</Badge>
        } else if (details.accepted) {
            return <Badge variant="default" className="bg-blue-500">Accepted</Badge>
        } else {
            return <Badge variant="default" className="bg-yellow-500">Pending</Badge>
        }
    }

    const fetchInventory = async () => {
        try {
            setLoading(prev => ({ ...prev, inventory: true }))
            const inventoryData = await getInventoryForPharmacy(address)
            setInventoryState(inventoryData)
        } catch (error) {
            console.error("Error fetching inventory:", error)
            toast.error("Failed to fetch inventory")
        } finally {
            setLoading(prev => ({ ...prev, inventory: false }))
        }
    }

    const handleAddDrugs = async () => {
        try {
            setLoading(prev => ({ ...prev, adding: true }))
            const drugIds = newDrugs.map(d => parseInt(d.drugId))
            const stocks = newDrugs.map(d => parseInt(d.stock))
            const expirations = newDrugs.map(d => d.expiration)

            await setInventory(drugIds, stocks, expirations)
            toast.success("Drugs added to inventory successfully")
            setShowAddDialog(false)
            setNewDrugs([{ drugId: '', stock: '', expiration: '' }])
            await fetchInventory()
        } catch (error) {
            console.error("Error adding drugs:", error)
            toast.error("Failed to add drugs to inventory")
        } finally {
            setLoading(prev => ({ ...prev, adding: false }))
        }
    }

    const handleUpdateDrug = async (drugId, amount, expiration) => {
        try {
            setLoading(prev => ({ ...prev, updating: drugId }))
            await updatePharmacyInventory(address, drugId, parseInt(amount), expiration)
            toast.success("Drug updated successfully")
            await fetchInventory()
        } catch (error) {
            console.error("Error updating drug:", error)
            toast.error("Failed to update drug")
        } finally {
            setLoading(prev => ({ ...prev, updating: null }))
        }
    }

    const addNewDrugField = () => {
        setNewDrugs(prev => [...prev, { drugId: '', stock: '', expiration: '' }])
    }

    const updateNewDrugField = (index, field, value) => {
        setNewDrugs(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            return updated
        })
    }

    const getExpirationStatus = (expiration) => {
        const expirationDate = new Date(expiration)
        const now = new Date()
        const daysUntilExpiration = Math.floor((expirationDate - now) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiration < 0) {
            return { color: 'bg-red-500', text: 'Expired' }
        } else if (daysUntilExpiration < 30) {
            return { color: 'bg-yellow-500', text: 'Expiring Soon' }
        } else {
            return { color: 'bg-green-500', text: 'Valid' }
        }
    }

    const getStockStatus = (stock) => {
        if (stock <= 10) {
            return { color: 'bg-red-500', text: 'Low Stock' }
        } else if (stock <= 50) {
            return { color: 'bg-yellow-500', text: 'Medium Stock' }
        } else {
            return { color: 'bg-green-500', text: 'Good Stock' }
        }
    }

    return (
        <div className="container mx-auto py-10">
            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{prescriptionIds.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                <Pill className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {getPendingPrescriptionsCount()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                                <Check className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {getAcceptedPrescriptionsCount()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ordered</CardTitle>
                                <Store className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {getOrderedPrescriptionsCount()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="prescriptions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Prescriptions</CardTitle>
                            <CardDescription>Manage prescriptions assigned to your pharmacy</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading.prescriptions ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {prescriptionIds.map((prescriptionId) => {
                                            const details = prescriptionDetails[prescriptionId]
                                            const isLoading = isLoadingDetails(prescriptionId)

                                            return (
                                                <TableRow key={prescriptionId}>
                                                    <TableCell>{prescriptionId}</TableCell>
                                                    <TableCell className="font-mono">
                                                        {isLoading ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : details?.patient || 'Loading...'}
                                                    </TableCell>
                                                    <TableCell className="font-mono">
                                                        {isLoading ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : details?.doctor || 'Loading...'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {isLoading ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : getStatusBadge(details)}
                                                    </TableCell>
                                                    <TableCell className="space-x-2 flex flex-row items-center">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleViewDetails(prescriptionId)}
                                                            disabled={isLoading}
                                                        >
                                                            {isLoading ? (
                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            ) : null}
                                                            View Details
                                                        </Button>
                                                        {!details?.accepted && !details?.ordered && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => handleAcceptPrescription(prescriptionId)}
                                                                disabled={loading.accepting === prescriptionId}
                                                            >
                                                                {loading.accepting === prescriptionId ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                ) : (
                                                                    <Check className="h-4 w-4 mr-2" />
                                                                )}
                                                                Accept
                                                            </Button>
                                                        )}
                                                        {details?.accepted && !details?.ordered && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => handleOrderPrescription(prescriptionId)}
                                                                disabled={loading.ordering === prescriptionId}
                                                            >
                                                                {loading.ordering === prescriptionId ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                ) : (
                                                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                                                )}
                                                                Order
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Inventory Management</h2>
                            <div className="space-x-2">
                                <Button 
                                    variant="outline"
                                    onClick={fetchInventory}
                                    disabled={loading.inventory}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                                <Button onClick={() => setShowAddDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Drugs
                                </Button>
                            </div>
                        </div>

                        {loading.inventory ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {inventory.map((item, index) => (
                                    <Card key={index} className="relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-2 h-full ${getStockStatus(item.stock).color}`} />
                                        <CardHeader>
                                            <CardTitle className="flex justify-between items-center">
                                                Drug ID: {item.drugId}
                                                <Badge className={getStockStatus(item.stock).color}>
                                                    {getStockStatus(item.stock).text}
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription>
                                                <Badge className={getExpirationStatus(item.expiration).color}>
                                                    {getExpirationStatus(item.expiration).text}
                                                </Badge>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Current Stock:</span>
                                                    <span className="font-medium">{item.stock}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Expiration:</span>
                                                    <span className="font-medium">{new Date(item.expiration).toLocaleDateString()}</span>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="space-y-4">
                                                    <Label>Update Stock</Label>
                                                    <div className="flex w-full space-x-2">
                                                        <Input
                                                            type="number"
                                                            placeholder="New amount"
                                                            className=""
                                                            onChange={(e) => updateNewDrugField(item.drugId, 'stock', e.target.value)}
                                                        />
                                                        <Input
                                                            type="date"
                                                            className=""
                                                            onChange={(e) => updateNewDrugField(item.drugId, 'expiration', e.target.value)}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={loading.updating === item.drugId}
                                                            onClick={() => handleUpdateDrug(
                                                                item.drugId,
                                                                newDrugs[item.drugId]?.stock,
                                                                newDrugs[item.drugId]?.expiration
                                                            )}
                                                        >
                                                            {loading.updating === item.drugId ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                "Update"
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Add New Drugs</AlertDialogTitle>
                        <AlertDialogDescription>
                            Add one or more drugs to your inventory
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        {newDrugs.map((drug, index) => (
                            <div key={index} className="grid grid-cols-3 gap-2">
                                <div>
                                    <Label>Drug ID</Label>
                                    <Input
                                        type="number"
                                        value={drug.drugId}
                                        onChange={(e) => updateNewDrugField(index, 'drugId', e.target.value)}
                                        placeholder="Drug ID"
                                    />
                                </div>
                                <div>
                                    <Label>Stock</Label>
                                    <Input
                                        type="number"
                                        value={drug.stock}
                                        onChange={(e) => updateNewDrugField(index, 'stock', e.target.value)}
                                        placeholder="Amount"
                                    />
                                </div>
                                <div>
                                    <Label>Expiration</Label>
                                    <Input
                                        type="date"
                                        value={drug.expiration}
                                        onChange={(e) => updateNewDrugField(index, 'expiration', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addNewDrugField}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Drug
                        </Button>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAddDrugs}
                            disabled={loading.adding}
                        >
                            {loading.adding ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Add Drugs
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="min-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Prescription Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about the prescription
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPrescriptionId && (
                        <div className="space-y-6">
                            {isLoadingDetails(selectedPrescriptionId) ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : prescriptionDetails[selectedPrescriptionId] ? (
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <h3 className="font-semibold mb-2">Patient</h3>
                                            <p className="font-mono">
                                                {prescriptionDetails[selectedPrescriptionId].patient}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Doctor</h3>
                                            <p className="font-mono">
                                                {prescriptionDetails[selectedPrescriptionId].doctor}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Details Hash</h3>
                                            <p className="font-mono">
                                                {prescriptionDetails[selectedPrescriptionId].detailsHash.slice(0, 10)}...{prescriptionDetails[selectedPrescriptionId].detailsHash.slice(-10)}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Status</h3>
                                            <div>
                                                {getStatusBadge(prescriptionDetails[selectedPrescriptionId])}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Medications</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Drug ID</TableHead>
                                                    <TableHead>Dosage</TableHead>
                                                    <TableHead>Duration (Days)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {prescriptionDetails[selectedPrescriptionId].medications?.map((med, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{med.drugId}</TableCell>
                                                        <TableCell>{med.dosage}</TableCell>
                                                        <TableCell>{med.no_days}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        {!prescriptionDetails[selectedPrescriptionId].accepted && 
                                         !prescriptionDetails[selectedPrescriptionId].ordered && (
                                            <Button
                                                onClick={() => handleAcceptPrescription(selectedPrescriptionId)}
                                                disabled={loading.accepting === selectedPrescriptionId}
                                            >
                                                {loading.accepting === selectedPrescriptionId ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <Check className="h-4 w-4 mr-2" />
                                                )}
                                                Accept Prescription
                                            </Button>
                                        )}
                                        {prescriptionDetails[selectedPrescriptionId].accepted && 
                                         !prescriptionDetails[selectedPrescriptionId].ordered && (
                                            <Button
                                                onClick={() => handleOrderPrescription(selectedPrescriptionId)}
                                                disabled={loading.ordering === selectedPrescriptionId}
                                            >
                                                {loading.ordering === selectedPrescriptionId ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                                )}
                                                Order Prescription
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    Failed to load prescription details
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PharmacyPage