'use client'

import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { 
    getPrescriptionsByPatient, 
    getRole,
    getPrescriptionfromId,
    acceptPrescription
} from '@/context/prescriptionServices'
import { toast } from 'sonner'
import { Loader2, ClipboardList, Pill, Store, Check, ShoppingCart } from 'lucide-react'
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
    CardTitle
} from "@/components/ui"
import { useRouter } from 'next/navigation'

const PatientPage = () => {
    const [prescriptionIds, setPrescriptionIds] = useState([])
    const [prescriptionDetails, setPrescriptionDetails] = useState({})
    const [loading, setLoading] = useState({
        prescriptions: false,
        details: new Set(),
        accepting: null
    })
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)

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
                  case 3:
                    router.push("/pharmacy");
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
            fetchPrescriptionIds()
        }
    }, [address])

    const fetchPrescriptionIds = async () => {
        try {
            setLoading(prev => ({ ...prev, prescriptions: true }))
            const ids = await getPrescriptionsByPatient(address)
            setPrescriptionIds(ids)
            // Fetch details for each prescription
            ids.forEach(async (id) => {
              await fetchPrescriptionDetails(id)
            });
        } catch (error) {
            console.error("Error fetching prescriptions:", error)
            toast.error("Failed to fetch prescriptions")
        } finally {
            setLoading(prev => ({ ...prev, prescriptions: false }))
        }
    }

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

    const handleAcceptPrescription = async (prescriptionId) => {
        try {
            setLoading(prev => ({ ...prev, accepting: prescriptionId }))
            await acceptPrescription(prescriptionId)
            toast.success("Prescription accepted successfully")
            
            // Refresh the prescription details
            await fetchPrescriptionDetails(prescriptionId)
        } catch (error) {
            console.error("Error accepting prescription:", error)
            toast.error("Failed to accept prescription")
        } finally {
            setLoading(prev => ({ ...prev, accepting: null }))
        }
    }

    const getActivePrescriptionsCount = () => {
        return Object.values(prescriptionDetails).filter(p => !p?.ordered).length
    }

    const getUniquePharmaciesCount = () => {
        const pharmacies = new Set(
            Object.values(prescriptionDetails)
                .map(p => p?.recommendedPharmacy)
                .filter(Boolean)
        )
        return pharmacies.size
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

    const handleBuyPrescription = (prescriptionId) => {
        const details = prescriptionDetails[prescriptionId];
        if (!details) return;

        console.log("Buying prescription:", {
            prescriptionId,
            doctor: details.doctor,
            pharmacy: details.recommendedPharmacy,
            detailsHash: details.detailsHash,
            medications: details.medications,
            status: {
                ordered: details.ordered,
                accepted: details.accepted
            }
        });

        toast.success("Purchase details logged to console");
    }

    return (
        <div className="container mx-auto py-10">
            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="prescriptions">My Prescriptions</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                                <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
                                <Pill className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {getActivePrescriptionsCount()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Recommended Pharmacies</CardTitle>
                                <Store className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {getUniquePharmaciesCount()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="prescriptions">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Prescriptions</CardTitle>
                            <CardDescription>List of all your prescriptions</CardDescription>
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
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Pharmacy</TableHead>
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
                                                        ) : details?.doctor || 'Loading...'}
                                                    </TableCell>
                                                    <TableCell className="font-mono">
                                                        {isLoading ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : details?.recommendedPharmacy || 'Loading...'}
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
                                                        {details?.accepted && !details?.ordered && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => handleBuyPrescription(prescriptionId)}
                                                            >
                                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                                Buy
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
            </Tabs>

            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="min-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Prescription Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about your prescription
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
                                            <h3 className="font-semibold mb-2">Doctor</h3>
                                            <p className="font-mono">
                                                {prescriptionDetails[selectedPrescriptionId].doctor}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Pharmacy</h3>
                                            <p className="font-mono">
                                                {prescriptionDetails[selectedPrescriptionId].recommendedPharmacy}
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
                                        {!prescriptionDetails[selectedPrescriptionId].accepted && (
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
                                                onClick={() => handleBuyPrescription(selectedPrescriptionId)}
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                Buy Prescription
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

export default PatientPage 