'use client'

import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { 
    mintBatchDrugs,
    getDrugMetadata,
    getOwnershipHistory,
    getTokenCounter,
    getBalance,
    transferDrugs,
    setApprovalForAll,
    isApprovedForAll,
} from '@/context/companyServices'
import { getRole } from '@/context/prescriptionServices'
import { toast } from 'sonner'
import { 
    Loader2, 
    Plus, 
    History, 
    Package, 
    Truck, 
    Factory, 
    Boxes,
    RefreshCw
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Button,
    Input,
    Label,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Separator
} from "@/components/ui"

const CompanyPage = () => {
    const [loading, setLoading] = useState({
        minting: false,
        transferring: false,
        approving: false,
        tokens: false,
        history: new Set()
    })
    const [tokens, setTokens] = useState([])
    const [showMintDialog, setShowMintDialog] = useState(false)
    const [showTransferDialog, setShowTransferDialog] = useState(false)
    const [mintForm, setMintForm] = useState({
        drugId: '',
        drugName: '',
        manufacturingDate: '',
        expirationDate: '',
        mrp: '',
        amount: ''
    })
    const [transferForm, setTransferForm] = useState({
        to: '',
        tokenId: '',
        amount: ''
    })
    const [selectedToken, setSelectedToken] = useState(null)
    const [showHistoryDialog, setShowHistoryDialog] = useState(false)
    const [history, setHistory] = useState([])

    const { address, isConnected } = useAccount()
    const router = useRouter()

    useEffect(() => {
        if (!isConnected || !address) return;

        const checkRole = async () => {
            try {
                const roleNo = await getRole(address);
                if (roleNo !== 4) { // 4 is the role number for pharmaceutical company
                    router.push("/login");
                }
            } catch (error) {
                console.error("Error checking role:", error);
                router.push("/login");
            }
        };

        checkRole();
        fetchTokens();
    }, [isConnected, address]);

    const fetchTokens = async () => {
        try {
            setLoading(prev => ({ ...prev, tokens: true }))
            const counter = await getTokenCounter()
            const tokenData = []
            
            for (let i = 1; i <= counter; i++) {
                const metadata = await getDrugMetadata(i)
                const balance = await getBalance(address, i)
                if (metadata.manufacturer.toLowerCase() === address.toLowerCase() || balance > 0) {
                    tokenData.push({ id: i, ...metadata, balance })
                }
            }
            
            setTokens(tokenData)
        } catch (error) {
            console.error("Error fetching tokens:", error)
            toast.error("Failed to fetch drug tokens")
        } finally {
            setLoading(prev => ({ ...prev, tokens: false }))
        }
    }

    const handleMint = async () => {
        try {
            setLoading(prev => ({ ...prev, minting: true }))
            const manufacturingDate = new Date(mintForm.manufacturingDate).getTime() / 1000
            const expirationDate = new Date(mintForm.expirationDate).getTime() / 1000
            
            await mintBatchDrugs(
                address,
                parseInt(mintForm.drugId),
                mintForm.drugName,
                manufacturingDate,
                expirationDate,
                parseInt(mintForm.mrp),
                parseInt(mintForm.amount)
            )
            
            toast.success("Drug batch minted successfully")
            setShowMintDialog(false)
            setMintForm({
                drugId: '',
                drugName: '',
                manufacturingDate: '',
                expirationDate: '',
                mrp: '',
                amount: ''
            })
            await fetchTokens()
        } catch (error) {
            console.error("Error minting drugs:", error)
            toast.error("Failed to mint drug batch")
        } finally {
            setLoading(prev => ({ ...prev, minting: false }))
        }
    }

    const handleTransfer = async () => {
        try {
            if (!transferForm.to || !transferForm.tokenId || !transferForm.amount) {
                toast.error("Please fill in all fields")
                return
            }

            // Basic address validation
            if (!transferForm.to.match(/^0x[a-fA-F0-9]{40}$/)) {
                toast.error("Invalid recipient address")
                return
            }

            setLoading(prev => ({ ...prev, transferring: true }))
            
            // First check if approved
            const isApproved = await isApprovedForAll(address, transferForm.to)
            
            if (!isApproved) {
                setLoading(prev => ({ ...prev, approving: true }))
                // Set approval first
                await setApprovalForAll(transferForm.to, true)
                toast.success("Transfer approval granted")
                setLoading(prev => ({ ...prev, approving: false }))
            }

            // Now proceed with transfer
            await transferDrugs(
                transferForm.to,
                [parseInt(transferForm.tokenId)],
                [parseInt(transferForm.amount)]
            )
            
            toast.success("Drugs transferred successfully")
            setShowTransferDialog(false)
            setTransferForm({
                to: '',
                tokenId: '',
                amount: ''
            })
            await fetchTokens()
        } catch (error) {
            console.error("Error transferring drugs:", error)
            toast.error(error.reason || "Failed to transfer drugs")
        } finally {
            setLoading(prev => ({ ...prev, transferring: false, approving: false }))
        }
    }

    const viewHistory = async (tokenId) => {
        try {
            setSelectedToken(tokenId)
            setShowHistoryDialog(true)
            setLoading(prev => ({
                ...prev,
                history: new Set([...prev.history, tokenId])
            }))
            
            const historyData = await getOwnershipHistory(tokenId)
            setHistory(historyData)
        } catch (error) {
            console.error("Error fetching history:", error)
            toast.error("Failed to fetch transfer history")
        } finally {
            setLoading(prev => ({
                ...prev,
                history: new Set([...prev.history].filter(id => id !== tokenId))
            }))
        }
    }

    const getExpirationStatus = (expirationDate) => {
        const now = Date.now() / 1000
        const daysUntilExpiration = Math.floor((expirationDate - now) / (86400))

        if (daysUntilExpiration < 0) {
            return { color: 'bg-red-500', text: 'Expired' }
        } else if (daysUntilExpiration < 30) {
            return { color: 'bg-yellow-500', text: 'Expiring Soon' }
        } else {
            return { color: 'bg-green-500', text: 'Valid' }
        }
    }

    const getStockStatus = (balance) => {
        if (balance === 0) {
            return { color: 'bg-red-500', text: 'Out of Stock' }
        } else if (balance <= 100) {
            return { color: 'bg-yellow-500', text: 'Low Stock' }
        } else {
            return { color: 'bg-green-500', text: 'In Stock' }
        }
    }

    return (
        <div className="container mx-auto py-10">
            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="inventory">Drug Inventory</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Drug Types</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{tokens.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                                <Boxes className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {tokens.reduce((acc, token) => acc + token.balance, 0)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                                <Factory className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="space-x-2">
                                <Button onClick={() => setShowMintDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Mint New Batch
                                </Button>
                                <Button variant="outline" onClick={() => setShowTransferDialog(true)}>
                                    <Truck className="h-4 w-4 mr-2" />
                                    Transfer Drugs
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="inventory">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Drug Inventory</h2>
                            <div className="space-x-2">
                                <Button 
                                    variant="outline"
                                    onClick={fetchTokens}
                                    disabled={loading.tokens}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                                <Button onClick={() => setShowMintDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Mint New Batch
                                </Button>
                            </div>
                        </div>

                        {loading.tokens ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {tokens.map((token) => (
                                    <Card key={token.id} className="relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-2 h-full ${getStockStatus(token.balance).color}`} />
                                        <CardHeader>
                                            <CardTitle className="flex justify-between items-center">
                                                {token.drugName}
                                                <Badge className={getStockStatus(token.balance).color}>
                                                    {getStockStatus(token.balance).text}
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span>Drug ID: {token.drugId}</span>
                                                    <Badge className={getExpirationStatus(token.expirationDate).color}>
                                                        {getExpirationStatus(token.expirationDate).text}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Token ID: {token.id}</span>
                                                    <span>MRP: ₹{token.mrp}</span>
                                                </div>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Current Stock:</span>
                                                    <span className="font-medium">{token.balance}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Manufacturing:</span>
                                                    <span className="font-medium">
                                                        {new Date(token.manufacturingDate * 1000).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Expiration:</span>
                                                    <span className="font-medium">
                                                        {new Date(token.expirationDate * 1000).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="flex space-x-2">
                                                    <Button
                                                        className="flex-1"
                                                        variant="outline"
                                                        onClick={() => viewHistory(token.id)}
                                                        disabled={loading.history.has(token.id)}
                                                    >
                                                        {loading.history.has(token.id) ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <History className="h-4 w-4 mr-2" />
                                                        )}
                                                        History
                                                    </Button>
                                                    <Button
                                                        className="flex-1"
                                                        variant="default"
                                                        onClick={() => {
                                                            setTransferForm(prev => ({
                                                                ...prev,
                                                                tokenId: token.id.toString()
                                                            }))
                                                            setShowTransferDialog(true)
                                                        }}
                                                        disabled={token.balance === 0}
                                                    >
                                                        <Truck className="h-4 w-4 mr-2" />
                                                        Transfer
                                                    </Button>
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

            {/* Mint Dialog */}
            <AlertDialog open={showMintDialog} onOpenChange={setShowMintDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mint New Drug Batch</AlertDialogTitle>
                        <AlertDialogDescription>
                            Create a new batch of drugs with the following details
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Drug ID</Label>
                                <Input
                                    type="number"
                                    value={mintForm.drugId}
                                    onChange={(e) => setMintForm(prev => ({ ...prev, drugId: e.target.value }))}
                                    placeholder="Enter Drug ID"
                                />
                            </div>
                            <div>
                                <Label>Drug Name</Label>
                                <Input
                                    type="text"
                                    value={mintForm.drugName}
                                    onChange={(e) => setMintForm(prev => ({ ...prev, drugName: e.target.value }))}
                                    placeholder="Enter Drug Name"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Manufacturing Date</Label>
                                <Input
                                    type="date"
                                    value={mintForm.manufacturingDate}
                                    onChange={(e) => setMintForm(prev => ({ ...prev, manufacturingDate: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Expiration Date</Label>
                                <Input
                                    type="date"
                                    value={mintForm.expirationDate}
                                    onChange={(e) => setMintForm(prev => ({ ...prev, expirationDate: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>MRP (₹)</Label>
                                <Input
                                    type="number"
                                    value={mintForm.mrp}
                                    onChange={(e) => setMintForm(prev => ({ ...prev, mrp: e.target.value }))}
                                    placeholder="Enter MRP"
                                />
                            </div>
                            <div>
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    value={mintForm.amount}
                                    onChange={(e) => setMintForm(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="Enter Amount"
                                />
                            </div>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleMint}
                            disabled={loading.minting}
                        >
                            {loading.minting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Factory className="h-4 w-4 mr-2" />
                            )}
                            Mint Batch
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Transfer Dialog */}
            <AlertDialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Transfer Drugs</AlertDialogTitle>
                        <AlertDialogDescription>
                            Transfer drugs to another address. You will need to approve the transfer first if not already approved.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Recipient Address</Label>
                            <Input
                                value={transferForm.to}
                                onChange={(e) => setTransferForm(prev => ({ ...prev, to: e.target.value }))}
                                placeholder="Enter recipient's address"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Token ID</Label>
                                <Input
                                    type="number"
                                    value={transferForm.tokenId}
                                    onChange={(e) => setTransferForm(prev => ({ ...prev, tokenId: e.target.value }))}
                                    placeholder="Enter Token ID"
                                />
                            </div>
                            <div>
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    value={transferForm.amount}
                                    onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="Enter Amount"
                                />
                            </div>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleTransfer}
                            disabled={loading.transferring || loading.approving}
                        >
                            {loading.approving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Approving...
                                </>
                            ) : loading.transferring ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Transferring...
                                </>
                            ) : (
                                <>
                                    <Truck className="h-4 w-4 mr-2" />
                                    Transfer
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* History Dialog */}
            <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Transfer History</DialogTitle>
                        <DialogDescription>
                            Transfer history for Token ID: {selectedToken}
                        </DialogDescription>
                    </DialogHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-mono">
                                        {item.from === "0x0000000000000000000000000000000000000000" 
                                            ? "Minted"
                                            : `${item.from.slice(0, 6)}...${item.from.slice(-4)}`
                                        }
                                    </TableCell>
                                    <TableCell className="font-mono">
                                        {`${item.to.slice(0, 6)}...${item.to.slice(-4)}`}
                                    </TableCell>
                                    <TableCell>{item.amount}</TableCell>
                                    <TableCell>
                                        {new Date(item.timestamp * 1000).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CompanyPage