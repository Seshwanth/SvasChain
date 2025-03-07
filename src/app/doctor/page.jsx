"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "wagmi";
import {
  createPrescription,
  getPatientsOfDoctor,
  getPrescriptionsByDoctor,
  getRole,
} from "@/context/prescriptionServices";
import { toast } from "sonner";
import { Loader2, Plus, Users, ClipboardList } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";

const DoctorPage = () => {
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState({
    patients: false,
    prescriptions: false,
    create: false,
  });

  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected || !address) return;

    const getRolenPrint = async () => {
      try {
        const roleNo = await getRole(address);
        switch (roleNo) {
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
  }, [isConnected, address]);

  // New prescription form state
  const [newPrescription, setNewPrescription] = useState({
    patient: "",
    recommendedPharmacy: "",
    detailsHash: "",
    medications: [{ drugId: "", dosage: "", no_days: "" }],
  });

  useEffect(() => {
    if (address) {
      fetchPatientsAndPrescriptions();
    }
  }, [address]);

  const fetchPatientsAndPrescriptions = async () => {
    try {
      setLoading((prev) => ({ ...prev, patients: true }));
      const patientList = await getPatientsOfDoctor(address);
      setPatients(patientList);
    } catch (error) {
      toast.error("Failed to fetch patients");
    } finally {
      setLoading((prev) => ({ ...prev, patients: false }));
    }

    try {
      setLoading((prev) => ({ ...prev, prescriptions: true }));
      const prescriptionList = await getPrescriptionsByDoctor(address);
      setPrescriptions(prescriptionList);
    } catch (error) {
      toast.error("Failed to fetch prescriptions");
    } finally {
      setLoading((prev) => ({ ...prev, prescriptions: false }));
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, create: true }));
    try {
      const medications = newPrescription.medications.map((med) => ({
        drugId: parseInt(med.drugId),
        dosage: parseInt(med.dosage),
        no_days: parseInt(med.no_days),
      }));
      console.log(medications);

      await createPrescription(
        ethers.getAddress(newPrescription.patient),
        ethers.getAddress(newPrescription.recommendedPharmacy),
        ethers.encodeBytes32String(newPrescription.detailsHash),
        medications
      );
      toast.success("Prescription created successfully");
      // Reset form
      setNewPrescription({
        patient: "",
        recommendedPharmacy: "",
        detailsHash: "",
        medications: [{ drugId: "", dosage: "", no_days: "" }],
      });
      // Refresh prescriptions list
      fetchPatientsAndPrescriptions();
    } catch (error) {
      toast.error("Failed to create prescription");
    } finally {
      setLoading((prev) => ({ ...prev, create: false }));
    }
  };

  const addMedication = () => {
    setNewPrescription((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { drugId: "", dosage: "", no_days: "" },
      ],
    }));
  };

  const updateMedication = (index, field, value) => {
    setNewPrescription((prev) => {
      const newMedications = [...prev.medications];
      newMedications[index] = {
        ...newMedications[index],
        [field]: value,
      };
      return { ...prev, medications: newMedications };
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="create">Create Prescription</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Patients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patients.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Prescriptions
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{prescriptions.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Prescription</CardTitle>
              <CardDescription>
                Fill in the details to create a new prescription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePrescription} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="patient">Patient Address</Label>
                    <Input
                      id="patient"
                      value={newPrescription.patient}
                      onChange={(e) => {
                        const value = e.target.value;
                        const formattedValue = value.startsWith("0x")
                          ? value.slice(2)
                          : value;
                        setNewPrescription((prev) => ({
                          ...prev,
                          patient: formattedValue,
                        }));
                      }}
                      placeholder="0x..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pharmacy">Recommended Pharmacy</Label>
                    <Input
                      id="pharmacy"
                      value={newPrescription.recommendedPharmacy}
                      onChange={(e) => {
                        const value = e.target.value;
                        const formattedValue = value.startsWith("0x")
                          ? value.slice(2)
                          : value;
                        setNewPrescription((prev) => ({
                          ...prev,
                          recommendedPharmacy: formattedValue,
                        }));
                      }}
                      placeholder="0x..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="details">Details Hash</Label>
                    <Input
                      id="details"
                      value={newPrescription.detailsHash}
                      onChange={(e) => {
                        const value = e.target.value;
                        const formattedValue = value.startsWith("0x")
                          ? value.slice(2)
                          : value;
                        setNewPrescription((prev) => ({
                          ...prev,
                          detailsHash: formattedValue,
                        }));
                      }}
                      placeholder="0x..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Medications</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMedication}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                  {newPrescription.medications.map((med, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-3">
                      <div className="grid gap-2">
                        <Label>Drug ID</Label>
                        <Input
                          type="number"
                          value={med.drugId}
                          onChange={(e) =>
                            updateMedication(index, "drugId", e.target.value)
                          }
                          placeholder="Drug ID"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Dosage</Label>
                        <Input
                          type="number"
                          value={med.dosage}
                          onChange={(e) =>
                            updateMedication(index, "dosage", e.target.value)
                          }
                          placeholder="Dosage"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Number of Days</Label>
                        <Input
                          type="number"
                          value={med.no_days}
                          onChange={(e) =>
                            updateMedication(index, "no_days", e.target.value)
                          }
                          placeholder="Days"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading.create}
                >
                  {loading.create ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Prescription
                    </>
                  ) : (
                    "Create Prescription"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <CardTitle>My Patients</CardTitle>
              <CardDescription>List of all your patients</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.patients ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{patient}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>My Prescriptions</CardTitle>
              <CardDescription>
                List of all prescriptions you've created
              </CardDescription>
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
                      <TableHead>Pharmacy</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((prescription, index) => (
                      <TableRow key={index}>
                        <TableCell>{prescription.id}</TableCell>
                        <TableCell className="font-mono">
                          {prescription.patient}
                        </TableCell>
                        <TableCell className="font-mono">
                          {prescription.recommendedPharmacy}
                        </TableCell>
                        <TableCell>
                          {prescription.ordered
                            ? "Ordered"
                            : prescription.accepted
                            ? "Accepted"
                            : "Pending"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorPage;
