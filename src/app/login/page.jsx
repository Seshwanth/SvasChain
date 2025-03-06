'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { 
    UserCircle2, 
    Pill, 
    Building2, 
    Stethoscope,
    Loader2
} from 'lucide-react'
import { registerAsDoctor, registerAsPatient, registerAsPharmacy, registerAsPharmaceuticalCompany, getRole } from '../../context/prescriptionServices'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const LoginPage = () => {
    const { address, isConnected } = useAccount()
    const [isLoading, setIsLoading] = useState(false);
    const [loadingRole, setLoadingRole] = useState("");
    const router = useRouter()

    useEffect(() => {
        if (!isConnected || !address) return;

        const getRolenPrint = async () => {
            try {
                const roleNo = await getRole(address);
                switch (roleNo) {
                    case 1:
                        router.push("/doctor");
                        break;
                    case 2:
                        router.push("/patient");
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
    }, [isConnected, address, loadingRole]); 

    const handleRoleSubmit = async (role) => {
        if (!role) {
            toast.error("Please select a role");
            return;
        }
        setIsLoading(true);
        setLoadingRole(role);
        try {
            switch (role) {
                case "doctor":
                    await registerAsDoctor();
                    toast.success("Successfully registered as Doctor");
                    break;
                case "patient":
                    await registerAsPatient();
                    toast.success("Successfully registered as Patient");
                    break;
                case "pharmacy":
                    await registerAsPharmacy();
                    toast.success("Successfully registered as Pharmacy");
                    break;
                case "pharmaceutical":
                    await registerAsPharmaceuticalCompany();
                    toast.success("Successfully registered as Pharmaceutical Company");
                    break;
            }
        } catch (error) {
            toast.error("Failed to register role");
        } finally {
            setIsLoading(false);
            setLoadingRole("");
        }
    };

    const RoleButton = ({ role, icon: Icon, label }) => (
        <Button 
            variant="outline" 
            className={`h-32 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors relative ${
                isLoading && loadingRole === role ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleRoleSubmit(role)}
            disabled={isLoading}
        >
            {isLoading && loadingRole === role ? (
                <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
                <Icon className="h-8 w-8" />
            )}
            <span className="text-lg font-semibold">{label}</span>
            {/* {isLoading && loadingRole === role && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            )} */}
        </Button>
    );

    return (
        <div className='pt-48 flex items-center justify-center'>
            <Card className="w-[600px]">
                <CardHeader>
                    <CardTitle>Connect to SvasChain</CardTitle>
                    <CardDescription>Choose your role to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isConnected ? (
                        <div className="grid grid-cols-2 gap-4">
                            <RoleButton 
                                role="patient"
                                icon={UserCircle2}
                                label="Patient"
                            />
                            <RoleButton 
                                role="pharmacy"
                                icon={Pill}
                                label="Pharmacy"
                            />
                            <RoleButton 
                                role="pharmaceutical"
                                icon={Building2}
                                label="Company"
                            />
                            <RoleButton 
                                role="doctor"
                                icon={Stethoscope}
                                label="Doctor"
                            />
                        </div>
                    ) : (
                        <ConnectButton />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default LoginPage