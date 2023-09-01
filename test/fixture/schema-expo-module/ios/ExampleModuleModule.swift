import ExpoModulesCore

public class ExampleModuleModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExampleModule")

    AsyncFunction("helloAsync") { (options: [String: String]) in
      print("Hello 👋")
    }

    ViewManager {
      View {
        ExampleModuleView()
      }

      Prop("name") { (view: ExampleModuleView, prop: String) in
        print(prop)
      }
    }
  }
}
