import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/services/api";
import DashboardLayout from "@/components/DashboardLayout";

const formSchema = z.object({
  customer_issue: z.string().min(1, "Customer issue is required").max(500, "Issue description too long"),
  solution_given: z.string().min(1, "Solution is required").max(500, "Solution description too long"),
  technician_name: z.string().min(1, "Technician name is required").max(100, "Name too long"),
});

const Field = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_issue: "",
      solution_given: "",
      technician_name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await api.field.create({
        customer_issue: values.customer_issue,
        solution_given: values.solution_given,
        technician_name: values.technician_name,
      });

      toast.success("Field service record submitted successfully!");
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit record. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Field Service Report</CardTitle>
            <CardDescription>
              Record customer issues and solutions provided
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="customer_issue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Issue</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the issue reported by the customer"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="solution_given"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solution Given</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the solution provided"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technician_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technician Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Submit Report
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Field;
