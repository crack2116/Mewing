import { Building2, User, Truck, Users as UsersIcon, PlusCircle, Search, MoreHorizontal } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { clients } from "@/lib/data";

export default function ManagementPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl font-headline">Gestión</h1>
          <p className="text-muted-foreground">Administra clientes, conductores, vehículos y usuarios.</p>
        </div>
      </div>

      <Tabs defaultValue="clients" className="mt-4">
        <TabsList>
          <TabsTrigger value="clients"><Building2 className="mr-2 h-4 w-4" />Clientes</TabsTrigger>
          <TabsTrigger value="drivers"><User className="mr-2 h-4 w-4" />Conductores</TabsTrigger>
          <TabsTrigger value="vehicles"><Truck className="mr-2 h-4 w-4" />Vehículos</TabsTrigger>
          <TabsTrigger value="users"><UsersIcon className="mr-2 h-4 w-4" />Usuarios</TabsTrigger>
        </TabsList>
        <TabsContent value="clients" className="mt-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold font-headline">Clientes</h2>
                    <p className="text-muted-foreground">Lista de todos los clientes registrados.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Cliente
                </Button>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, RUC, contacto o dirección..."
                className="w-full appearance-none bg-card pl-8 shadow-none md:w-1/2 lg:w-1/3"
              />
            </div>
            <div className="mt-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>RUC</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Dirección</TableHead>
                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map((client) => (
                        <TableRow key={client.ruc}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.ruc}</TableCell>
                            <TableCell>
                                <div className="font-medium">{client.contact.name}</div>
                                <div className="text-sm text-muted-foreground">{client.contact.email}</div>
                            </TableCell>
                            <TableCell>{client.address}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Editar</DropdownMenuItem>
                                    <DropdownMenuItem>Eliminar</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TabsContent>
        <TabsContent value="drivers">
            <p className="text-muted-foreground">Administra la información de los conductores.</p>
        </TabsContent>
        <TabsContent value="vehicles">
            <p className="text-muted-foreground">Gestiona la flota de vehículos.</p>
        </TabsContent>
        <TabsContent value="users">
            <p className="text-muted-foreground">Administra los usuarios del sistema.</p>
        </TabsContent>
      </Tabs>
    </>
  );
}
