import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { serviceRequests } from "@/lib/data";
import type { ServiceRequest } from "@/lib/types";
import { PredictionCell } from "./prediction-cell";

export default function RecentRequests() {

  const getStatusVariant = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Delayed':
        return 'destructive';
      default:
        return 'default';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recent Service Requests</CardTitle>
        <CardDescription>An overview of the latest service requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.client.avatarUrl} alt={request.client.name} data-ai-hint="person portrait" />
                      <AvatarFallback>{request.client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{request.client.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
                </TableCell>
                <TableCell>{request.date}</TableCell>
                <TableCell className="text-right">
                  {request.status === 'Pending' && <PredictionCell requestId={request.id} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
