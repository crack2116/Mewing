import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, MapPin } from "lucide-react";

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Quick Actions</CardTitle>
        <CardDescription>Access common tasks quickly.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button className="w-full justify-start">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Request
        </Button>
        <Button variant="secondary" className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" />
          Manage Clients
        </Button>
        <Button variant="secondary" className="w-full justify-start">
          <MapPin className="mr-2 h-4 w-4" />
          Real-time Tracking
        </Button>
      </CardContent>
    </Card>
  );
}
